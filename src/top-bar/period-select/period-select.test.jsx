import { useConfig } from '@dhis2/app-runtime'
import { MenuItem, Tooltip } from '@dhis2/ui'
import { render } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { shallow } from 'enzyme'
import React from 'react'
import { useAppContext } from '../../app-context/index.js'
import { readQueryParams } from '../../navigation/read-query-params.js'
import { useSelectionContext } from '../../selection-context/index.js'
import { ContextSelect } from '../context-select/context-select.jsx'
import { PeriodMenu } from './period-menu.jsx'
import { PERIOD, PeriodSelect } from './period-select.jsx'
import { YearNavigator } from './year-navigator.jsx'

jest.mock('@dhis2/app-runtime', () => ({
    useConfig: jest.fn(),
}))

jest.mock('../../navigation/read-query-params.js', () => ({
    readQueryParams: jest.fn(),
}))

jest.mock('../../app-context/index.js', () => ({
    useAppContext: jest.fn(),
}))

jest.mock('../../selection-context/index.js', () => ({
    useSelectionContext: jest.fn(),
}))

const mockWorkflows = [
    {
        displayName: 'Workflow a',
        id: 'i5m0JPw4DQi',
        periodType: 'Monthly',
        dataSets: [{ id: 'some-dataset-id-1' }],
    },
    {
        displayName: 'Workflow B',
        id: 'rIUL3hYOjJc',
        periodType: 'Yearly',
        dataSets: [{ id: 'some-dataset-id-2' }],
    },
]

beforeEach(() => {
    useConfig.mockImplementation(() => ({
        systemInfo: {},
    }))
    useAppContext.mockImplementation(() => ({
        dataApprovalWorkflows: mockWorkflows,
    }))
    readQueryParams.mockImplementation(() => ({}))
})

afterEach(() => {
    jest.resetAllMocks()
})

describe('<PeriodSelect>', () => {
    it('renders a ContextSelect with YearNavigator and PeriodMenu', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {},
            openedSelect: '',
            selectPeriod: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<PeriodSelect />)

        expect(wrapper.type()).toBe(ContextSelect)
        expect(wrapper.find(YearNavigator)).toHaveLength(1)
        expect(wrapper.find(PeriodMenu)).toHaveLength(1)
    })

    it('is enabled if a workflow has been set', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {},
            openedSelect: '',
            selectPeriod: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<PeriodSelect />)

        expect(wrapper.find(ContextSelect).prop('disabled')).toBe(false)
    })

    it('is disabled if a workflow has not been set', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: {},
            period: {},
            openedSelect: '',
            selectPeriod: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<PeriodSelect />)

        expect(wrapper.find(ContextSelect).prop('disabled')).toBe(true)
    })

    it('renders a placeholder text when enabled and no period is selected', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {},
            openedSelect: '',
            selectPeriod: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<PeriodSelect />)
        const placeholder = 'Choose a period'

        expect(wrapper.find(ContextSelect).prop('disabled')).toBe(false)
        expect(wrapper.find(ContextSelect).prop('value')).toBe(undefined)
        expect(wrapper.find(ContextSelect).prop('placeholder')).toBe(
            placeholder
        )
        expect(
            wrapper.find(ContextSelect).shallow().text().includes(placeholder)
        ).toBe(true)
    })

    it('does not render a placeholder text when disabled and no period is selected', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: {},
            period: {},
            openedSelect: '',
            selectPeriod: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<PeriodSelect />)
        const placeholder = 'Choose a period'

        expect(wrapper.find(ContextSelect).prop('disabled')).toBe(true)
        expect(wrapper.find(ContextSelect).prop('value')).toBe('')
        expect(wrapper.find(ContextSelect).prop('placeholder')).toBe(
            placeholder
        )
        expect(
            wrapper.find(ContextSelect).shallow().text().includes(placeholder)
        ).toBe(false)
    })

    it('renders a the value when a period is selected', () => {
        const displayName = 'April 2012'

        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {
                id: '201204',
                displayName,
            },
            openedSelect: '',
            selectPeriod: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<PeriodSelect />)

        expect(wrapper.find(ContextSelect).prop('value')).toBe(displayName)
    })

    it('opens the ContextSelect when the opened select matches "PERIOD"', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {},
            openedSelect: PERIOD,
            selectPeriod: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<PeriodSelect />)

        expect(wrapper.find(ContextSelect).prop('open')).toBe(true)
    })

    it('calls the setOpenedSelect to open when clicking the ContextSelect button', () => {
        const setOpenedSelect = jest.fn()
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {},
            openedSelect: PERIOD,
            selectPeriod: () => {},
            setOpenedSelect,
        }))
        shallow(<PeriodSelect />)
            .find(ContextSelect)
            .dive()
            .find('button')
            .simulate('click')

        expect(setOpenedSelect).toHaveBeenCalledTimes(1)
        expect(setOpenedSelect).toHaveBeenCalledWith(PERIOD)
    })

    it('calls selectPeriod when clicking a MenuItem', () => {
        const selectPeriod = jest.fn()
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {
                id: '201204',
                displayName: 'April 2012',
                year: 2012,
            },
            orgUnit: {},
            attributeOptionCombo: {},
            openedSelect: PERIOD,
            selectPeriod,
            setOpenedSelect: () => {},
        }))

        shallow(<PeriodSelect />)
            .find(PeriodMenu)
            .dive()
            .find(MenuItem)
            .first()
            .simulate('click')

        expect(selectPeriod).toHaveBeenCalledTimes(1)
        expect(selectPeriod).toHaveBeenCalledWith({
            displayName: 'December 2012',
            endDate: '2012-12-31',
            id: '201212',
            iso: '201212',
            startDate: '2012-12-01',
        })
    })

    // Refactored from enzyme
    it('calls the setOpenedSelect to close when clicking the backdrop', async () => {
        const setOpenedSelect = jest.fn()
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {},
            openedSelect: PERIOD,
            selectPeriod: () => {},
            setOpenedSelect,
        }))

        render(<PeriodSelect />)

        // Janky way to select the backdrop, since it uses a portal
        const backdrop = document.querySelector(
            '[data-test="dhis2-uicore-layer"] > .backdrop'
        )
        await userEvent.click(backdrop)

        expect(setOpenedSelect).toHaveBeenCalledTimes(1)
        expect(setOpenedSelect).toHaveBeenCalledWith('')
    })

    it('displays the correct tooltip text when period has not been set yet', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: {},
            period: {},
            orgUnit: {},
            attributeOptionCombo: {},
            openedSelect: '',
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
        }))

        const wrapper = shallow(<PeriodSelect />)
        const tooltip = wrapper.find(ContextSelect).dive().find(Tooltip)

        expect(tooltip.prop('content')).toBe('Choose a workflow first')
    })
})
