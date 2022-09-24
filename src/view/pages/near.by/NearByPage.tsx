import React, {useEffect, useState} from 'react'
import {GetAllInfoType, GetInfoType} from '../../../type'
import {calDistance} from '../../../util/cal.distance'
import {convertEtaTime} from '../../../util/convert.eta.time'
import {DataServiceFactory} from '../../../service'
import {
    ListItem,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Stack,
    Typography,
    List
} from '@mui/material'
import NearMeIcon from '@mui/icons-material/NearMe'
import NearMeDisabledIcon from '@mui/icons-material/NearMeDisabled'
import {useSelector} from 'react-redux'
import {StateModel} from '../../../store/model/state.model'
import {merge} from "../../../util";

const dataServiceFactory = new DataServiceFactory()

const DEFAULT_REFRESH_SECONDS = (parseInt(import.meta.env.VITE_VAR_REFRESH_COUNTDOWN_DEFAULT) ?? 99) * 1000

export function NearByPage(): JSX.Element {
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
        console.log(Object.values(data) )
        setEstimateList((await Promise.all(Object.values(data)
            .reduce((acc, curVal) => {
                return merge(acc, curVal)
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
                        .sort((a, b) => a.distance - b.distance)[0] || 0
                }
            })
            .sort((a, b) => a.nearStop.distance - b.nearStop.distance)
            // .slice(0, 200)
            .map(async (route, index) => {
                return {
                    order: index,
                    co: route.co,
                    route: route.route,
                    dest: route.dest,
                    stop: route.nearStop.name,
                    distance: `${(route.nearStop.distance * 1000).toFixed(0)}m`,
                    eta: null
                    //(await dataServiceFactory
                    // .getETA(route.co, route.nearStop.stopId, route.route, route.service_type))[0]
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
                    ? <NearMeIcon style={{color: '#2787ff'}}/>
                    : <NearMeDisabledIcon style={{color: '#ababab'}}/>
            }
            <Card raised={true}>
                <CardContent>
                    Refresh Time: {Math.floor(timer / 1000)}
                    <LinearProgress variant="determinate" value={Math.round(timer / DEFAULT_REFRESH_SECONDS * 100)}/>
                </CardContent>
            </Card>
            <List
                sx={{width: '100%', bgcolor: 'background.paper'}}
                subheader={<ListSubheader>Bus</ListSubheader>}
            >
                {
                    estimateList
                        ?.map((e: any, index: any) => {
                            const {message, time} = convertEtaTime(e.eta?.eta, timer)
                            return <ListItem key={`bus-card-${index}`}>
                                <div style={{width: '3rem'}}>{e.co} {e.route}</div>
                                <ListItemText primary={<><span
                                    style={{fontSize: '0.5rem'}}>往&nbsp;</span>{e.dest?.[state.lang]}</>}
                                              secondary={`${e.stop?.[state.lang]} - ${e.distance}`}/>
                                {message != null && <span style={{fontSize: '0.5rem'}}>{message}&nbsp;</span>}{time}
                            </ListItem>
                        })
                }
            </List>
        </Stack>
    </>
}
