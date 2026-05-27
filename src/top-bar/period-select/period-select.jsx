import i18n from '@dhis2/d2-i18n'
import React, { useEffect, useState } from 'react'
import { useSelectionContext } from '../../selection-context/index.js'
import { getMostRecentCompletedYear } from '../../shared/index.js'
import { ContextSelect } from '../context-select/index.js'
import { PeriodMenu } from './period-menu.jsx'
import { YearNavigator } from './year-navigator.jsx'

export const PERIOD = 'PERIOD'

const computeMaxYear = (periodType) =>
    periodType ? getMostRecentCompletedYear(periodType) : null

const PeriodSelect = () => {
    const { period, workflow, selectPeriod, openedSelect, setOpenedSelect } =
        useSelectionContext()
    const [maxYear, setMaxYear] = useState(() =>
        computeMaxYear(workflow?.periodType)
    )
    const [year, setYear] = useState(period?.year || maxYear)
    const open = openedSelect === PERIOD
    const value = period?.displayName

    useEffect(() => {
        if (period?.year) {
            setYear(period.year)
        }
    }, [period?.year])

    useEffect(() => {
        if (workflow?.periodType) {
            const newMaxYear = computeMaxYear(workflow?.periodType)
            setMaxYear(newMaxYear)

            if (!period?.year) {
                setYear(newMaxYear)
            }
        }
    }, [workflow?.periodType])

    return (
        <ContextSelect
            dataTest="period-context-select"
            prefix={i18n.t('Period')}
            placeholder={i18n.t('Choose a period')}
            value={workflow?.dataSets?.length > 0 ? value : ''}
            open={open}
            disabled={!workflow?.id}
            onOpen={() => setOpenedSelect(PERIOD)}
            onClose={() => setOpenedSelect('')}
            requiredValuesMessage={i18n.t('Choose a workflow first')}
        >
            {year && (
                <>
                    <YearNavigator
                        maxYear={maxYear}
                        year={year}
                        onYearChange={(year) => {
                            selectPeriod(null)
                            setYear(year)
                        }}
                    />

                    <PeriodMenu periodType={workflow?.periodType} year={year} />
                </>
            )}
        </ContextSelect>
    )
}

export { PeriodSelect }
