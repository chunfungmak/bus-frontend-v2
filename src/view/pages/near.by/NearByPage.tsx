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
    List,
    Box,
    ListItemButton
} from '@mui/material'
import NearMeIcon from '@mui/icons-material/NearMe'
import NearMeDisabledIcon from '@mui/icons-material/NearMeDisabled'
import {useSelector} from 'react-redux'
import {StateModel} from '../../../store/model/state.model'
import {FixedSizeList, ListChildComponentProps} from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer'
import {merge} from "../../../util";

const dataServiceFactory = new DataServiceFactory()

const DEFAULT_REFRESH_SECONDS = (parseInt(import.meta.env.VITE_VAR_REFRESH_COUNTDOWN_DEFAULT) ?? 99) * 1000

function renderRow(props: ListChildComponentProps) {
    const {index, style} = props;

    return (
        <ListItem style={style} key={index} component="div" disablePadding>
            <ListItemButton>
                <ListItemText primary={`Item ${index + 1}`}/>
            </ListItemButton>
        </ListItem>
    );
}

export function NearByPage(): JSX.Element {
    const state = useSelector((state: StateModel) => state)

    const [data, setData] = useState<GetAllInfoType>()
    const [size, setSize] = useState<number>(10)

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
                return [...acc, ...curVal]
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
            .filter(e => e.nearStop.distance != null)
            .sort((a, b) => a.nearStop.distance - b.nearStop.distance)
            .slice(0, size)
            .map(async (route, index) => {
                return {
                    order: index,
                    co: route.co,
                    route: route.route,
                    dest: route.dest,
                    stop: route.nearStop.name,
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
                    ? <NearMeIcon style={{color: '#2787ff'}}/>
                    : <NearMeDisabledIcon style={{color: '#ababab'}}/>
            }
            <Card raised={true}>
                <CardContent>
                    Refresh Time: {Math.floor(timer / 1000)}
                    <LinearProgress variant="determinate" value={Math.round(timer / DEFAULT_REFRESH_SECONDS * 100)}/>
                </CardContent>
            </Card>

            <AutoSizer>
                {
                    ({width, height}) => (
                        <Box
                            className={'test'}
                            sx={{width: '100%', height: height, maxWidth: width, bgcolor: 'background.paper'}}
                        >
                            <FixedSizeList
                                height={height}
                                width={width}
                                itemSize={46}
                                itemCount={200}
                                overscanCount={5}
                            >
                                {renderRow}
                            </FixedSizeList>
                        </Box>

                    )
                }

            </AutoSizer>

            {/*<List*/}
            {/*    sx={{*/}
            {/*        width: '100%',*/}
            {/*        bgcolor: 'background.paper',*/}
            {/*        maxHeight: 'calc(100vh - 11rem)',*/}
            {/*        position: 'relative',*/}
            {/*        overflow: 'auto',*/}
            {/*    }}*/}
            {/*    subheader={<ListSubheader>Bus</ListSubheader>}*/}
            {/*>*/}
            {/*    {*/}
            {/*        estimateList*/}
            {/*            ?.map((e: any, index: any) => {*/}
            {/*                const {message, time} = convertEtaTime(e.eta?.eta, timer)*/}
            {/*                return <ListItem key={`bus-card-${index}`}>*/}
            {/*                    <div style={{width: '3rem'}}>{e.route}</div>*/}
            {/*                    <ListItemText primary={<><span*/}
            {/*                        style={{fontSize: '0.5rem'}}>往&nbsp;</span>{e.dest?.[state.lang]}</>}*/}
            {/*                                  secondary={`${e.co} ${e.stop?.[state.lang]} - ${e.distance}`}/>*/}
            {/*                    {message != null && <span style={{fontSize: '0.5rem'}}>{message}&nbsp;</span>}{time}*/}
            {/*                </ListItem>*/}
            {/*            })*/}
            {/*    }*/}
            {/*</List>*/}
        </Stack>
    </>
}
