import React, { useEffect, useState } from 'react'
import { GeolocationType, GetAllInfoType } from '../../../type'
import { calDistance } from '../../../util/cal.distance'
import { convertEtaTime } from '../../../util/convert.eta.time'
import { DataServiceFactory } from '../../../service'
import { Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material'
import NearMeIcon from '@mui/icons-material/NearMe'
import NearMeDisabledIcon from '@mui/icons-material/NearMeDisabled'

const dataServiceFactory = new DataServiceFactory()

const DEFAULT_REFRESH_SECONDS = (parseInt(import.meta.env.VITE_VAR_REFRESH_COUNTDOWN_DEFAULT) ?? 99) * 1000

export function NearByPage (): JSX.Element {
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState<GetAllInfoType>()
  const [userLocation, setUserLocation] = useState<GeolocationType>()

  useEffect(() => {
    const watchID = navigator.geolocation.watchPosition(function (position) {
      setUserLocation({ lat: position.coords.latitude, long: position.coords.longitude })
    })

    void initData()

    return () => {
      navigator.geolocation.clearWatch(watchID)
    }
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
                distance: calDistance(userLocation?.lat, userLocation?.long, stop.lat, stop.long)
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
          label: `[${route.route}] 往${route.dest.zh_TW}`,
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
  }, [data, userLocation])

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
        userLocation != null
          ? <NearMeIcon style={{ color: '#2787ff' }}/>
          : <NearMeDisabledIcon style={{ color: '#ababab' }}/>
      }
      <Card>
        <CardContent>
          Refresh Time: {Math.floor(timer / 1000)}
          <LinearProgress variant="determinate" value={Math.floor(timer / DEFAULT_REFRESH_SECONDS * 100)} />
        </CardContent>
      </Card>
          {
            estimateList
              ?.filter((e: any) => e.eta.eta != null)
              ?.map((e: any, index: any) => {
                return <Card key={`bus-card-${index}`}>
                  <CardContent style={{ padding: '0.75rem 0.75rem 0.75rem 0.75rem' }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {e.label}
                    </Typography>
                    {`${e.stop} (${e.distance})`}<br />
                    {`${convertEtaTime(e.eta.eta, timer)}${e.eta.rmk?.zh_TW !== '' ? ` ${e.eta.rmk?.zh_TW}` : ''}`}
                  </CardContent>
                </Card>
              })
          }
    </Stack>
  </>
}
