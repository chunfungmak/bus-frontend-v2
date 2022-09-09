import React, { useEffect, useState } from 'react'
import { GetAllInfoType } from '../../../type'
import { calDistance } from '../../../util/cal.distance'
import { convertEtaTime } from '../../../util/convert.eta.time'
import { DataServiceFactory } from '../../../service'
import { Card, CardContent, Grid, LinearProgress, Stack, Typography } from '@mui/material'
import NearMeIcon from '@mui/icons-material/NearMe'
import NearMeDisabledIcon from '@mui/icons-material/NearMeDisabled'
import { useSelector } from 'react-redux'
import { StateModel } from '../../../store/model/state.model'

const dataServiceFactory = new DataServiceFactory()

const DEFAULT_REFRESH_SECONDS = (parseInt(import.meta.env.VITE_VAR_REFRESH_COUNTDOWN_DEFAULT) ?? 99) * 1000

export function NearByPage (): JSX.Element {
  const state = useSelector((state: StateModel) => state)

  const [data, setData] = useState<GetAllInfoType>()

  useEffect(() => {
    void initData()
  }, [])

  const initData = async (): Promise<void> => {
    const payload = await dataServiceFactory.getAllInfo()
    setData(payload)
  }

  const [estimateList, setEstimateList] = useState<any>()

  const getEtas = async (): Promise<void> => {
    if (data == null) return
    setEstimateList((await Promise.all(Object.values(data)
      .reduce((acc, curVal) => {
        return acc.concat(curVal)
      }, [])
      .map(route => {
        return {
          ...route,
          nearStop: route.stops
            .map(stop => {
              return {
                ...stop,
                distance: calDistance(state.geolocation?.lat, state.geolocation?.long, stop.lat, stop.long)
              }
            })
            .sort((a, b) => a.distance - b.distance)[0]
        }
      })
      .sort((a, b) => a.nearStop.distance - b.nearStop.distance)
      .slice(0, 200)
      .map(async (route, index) => {
        return {
          order: index,
          co: route.co,
          route: route.route,
          label: `往${route.dest.zh_TW}`,
          stop: route.nearStop.name.zh_TW,
          distance: `${(route.nearStop.distance * 1000).toFixed(0)}m`,
          eta: (await dataServiceFactory
            .getETA(route.co, route.nearStop.stopId, route.route, route.service_type))[0]
        }
      })
    )))
  }

  useEffect(() => {
    void getEtas()
  }, [data, state.geolocation])

  const [timer, setTimer] = useState<number>(DEFAULT_REFRESH_SECONDS)

  useEffect(() => {
    const current = new Date().getTime()
    const interval = setInterval(() => {
      setTimer(() => {
        const time = DEFAULT_REFRESH_SECONDS - (new Date().getTime() - current) % DEFAULT_REFRESH_SECONDS
        if (DEFAULT_REFRESH_SECONDS === time) void getEtas()
        return time
      })
    }, 1)
    return () => clearInterval(interval)
  }, [])

  return <>
    <Stack spacing={2}>
      {
        state.geolocation != null
          ? <NearMeIcon style={{ color: '#2787ff' }}/>
          : <NearMeDisabledIcon style={{ color: '#ababab' }}/>
      }
      <Card raised={true}>
        <CardContent>
          Refresh Time: {Math.floor(timer / 1000)}
          <LinearProgress variant="determinate" value={Math.round(timer / DEFAULT_REFRESH_SECONDS * 100)} />
        </CardContent>
      </Card>
          {
            estimateList
              ?.filter((e: any) => e.eta.eta != null)
              ?.map((e: any, index: any) => {
                return <Card key={`bus-card-${index}`} raised={true}>
                  <CardContent style={{ padding: '0.75rem 0.75rem 0.75rem 0.75rem' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={7}>
                        <Typography gutterBottom variant="subtitle1" component="div">
                          [{e.co}] [{e.route}] {e.label}
                        </Typography>
                        {`${e.stop} (${e.distance})`}
                      </Grid>
                      <Grid item xs={5} sx={{ textAlign: 'right', margin: 'auto' }}>
                        <Typography gutterBottom variant="subtitle1" component="div">
                          {convertEtaTime(e.eta.eta, timer)}
                          {
                            e.eta.rmk?.zh_TW !== ''
                              ? <>
                                  <br/>
                                  {e.eta.rmk?.zh_TW}
                                </>
                              : <></>
                          }
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              })
          }
    </Stack>
  </>
}
