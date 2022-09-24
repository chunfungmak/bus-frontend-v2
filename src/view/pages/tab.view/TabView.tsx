import { Box, Tab, Tabs, Typography } from '@mui/material'
import { NearByPage } from '../near.by'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel (props: TabPanelProps): JSX.Element {
  const { children, value, index, ...other } = props

  return (
      <div
          role="tabpanel"
          hidden={value !== index}
          id={`tabpanel-${index}`}
          aria-labelledby={`tab-${index}`}
          {...other}
      >
        {value === index && (
            <Box sx={{ p: 0 }}>
              <Typography>{children}</Typography>
            </Box>
        )}
      </div>
  )
}

function a11yProps (index: number): Record<string, string> {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

export function TabView (): JSX.Element {
  const [value, setValue] = React.useState(0)
  const { t } = useTranslation()

  const handleChange = (event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue)
  }

  return <>
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
        <Tab label={t<string>('tab.nearBy')} {...a11yProps(0)} />
        <Tab label={t<string>('tab.nearBy')} {...a11yProps(1)} />
      </Tabs>
    </Box>
    <TabPanel value={value} index={0}>
      <NearByPage />
    </TabPanel>
    <TabPanel value={value} index={1}>
      <NearByPage />
    </TabPanel>
  </>
}
