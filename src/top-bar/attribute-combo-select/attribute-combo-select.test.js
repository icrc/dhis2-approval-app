import { mount, shallow } from 'enzyme'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { useAppContext } from '../../app-context/index.js'
import { readQueryParams } from '../../navigation/read-query-params.js'
import { useSelectionContext } from '../../selection-context/index.js'
import { ContextSelect } from '../context-select/context-select.jsx'
import { AttributeComboSelect } from './attribute-combo-select.jsx'

jest.mock('../../app-context/use-app-context', () => ({
    useAppContext: jest.fn(),
}))
jest.mock('../../selection-context/index', () => ({
    useSelectionContext: jest.fn(),
}))

jest.mock('../../navigation/read-query-params.js', () => ({
    readQueryParams: jest.fn(),
}))

const mockDataSets = [
    {
        id: 'dataset_1',
        displayName: 'Data set 1',
        periodType: 'Daily',
        categoryCombo: {
            id: 'catComboId1',
        },
        organisationUnits: [
            { id: 'ouId1', path: '/ouId1' },
            { id: 'ouId2', path: '/ouId2' },
        ],
    },
]

const mockWorkflows = [
    {
        id: 'i5m0JPw4DQi',
        displayName: 'Workflow a',
        periodType: 'Daily',
        dataSets: mockDataSets,
    },
    {
        displayName: 'Workflow B',
        id: 'rIUL3hYOjJc',
        periodType: 'Daily',
        dataSets: [
            {
                id: 'dataset_2',
                displayName: 'Data set 2',
                periodType: 'Daily',
                categoryCombo: {
                    id: 'combo_1',
                },
                organisationUnits: [
                    { id: 'ouId1', path: '/ouId1' },
                    { id: 'ouId2', path: '/ouId2' },
                ],
            },
        ],
    },
]

const mockOrgUnitRoots = [
    {
        id: 'ouId1',
        path: '/ouId1',
        displayName: 'Org unit 1',
    },
]

const mockMetadata = {
    categoryCombos: {
        catComboId1: {
            id: 'catComboId1',
            displayName: 'Combo 1',
            isDefault: false,
            categoryIds: ['catId1', 'catId2'],
        },
    },
    categories: {
        catId1: {
            id: 'catId1',
            displayName: 'Category 1',
            categoryOptionIds: ['catOptionId1', 'catOptionId2'],
        },
        catId2: {
            id: 'catId2',
            displayName: 'Category 2',
            categoryOptionIds: ['catOptionId3', 'catOptionId4'],
        },
    },
    categoryOptions: {
        catOptionId1: {
            id: 'catOptionId1',
            startDate: '2024-01-01T00:00:00',
            endDate: '2024-12-01T00:00:00',
            displayName: 'Category Option 1',
            organisationUnits: [{ id: 'ouId1', path: '/ouId1' }],
        },
        catOptionId2: {
            id: 'catOptionId2',
            startDate: '2024-01-01T00:00:00',
            endDate: '2024-12-01T00:00:00',
            displayName: 'Category Option 2',
            organisationUnits: [{ id: 'ouId1', path: '/ouId1' }],
        },
        catOptionId3: {
            id: 'catOptionId3',
            startDate: '2024-01-01T00:00:00',
            endDate: '2024-12-01T00:00:00',
            displayName: 'Category Option 3',
            organisationUnits: [{ id: 'ouId1', path: '/ouId1' }],
        },
        catOptionId4: {
            id: 'catOptionId4',
            startDate: '2024-01-01T00:00:00',
            endDate: '2024-12-01T00:00:00',
            displayName: 'Category Option 4',
            organisationUnits: [{ id: 'ouId1', path: '/ouId1' }],
        },
    },
    categoryOptionCombos: {
        catOptionComboId1: {
            id: 'catOptionComboId1',
            breakdown: [
                { categoryId: 'catId1', optionId: 'catOptionId1' },
                { categoryId: 'catId2', optionId: 'catOptionId3' },
            ],
            categoryOptionIds: ['catOptionId1', 'catOptionId3'],
            categoryComboId: 'catComboId1',
        },
        catOptionComboId2: {
            id: 'catOptionComboId2',
            breakdown: [
                { categoryId: 'catId1', optionId: 'catOptionId2' },
                { categoryId: 'catId2', optionId: 'catOptionId3' },
            ],
            categoryOptionIds: ['catOptionId2', 'catOptionId3'],
            categoryComboId: 'catComboId1',
        },
        catOptionComboId3: {
            id: 'catOptionComboId3',
            breakdown: [
                { categoryId: 'catId1', optionId: 'catOptionId1' },
                { categoryId: 'catId2', optionId: 'catOptionId4' },
            ],
            categoryOptionIds: ['catOptionId1', 'catOptionId4'],
            categoryComboId: 'catComboId1',
        },
        catOptionComboId4: {
            id: 'catOptionComboId4',
            breakdown: [
                { categoryId: 'catId1', optionId: 'catOptionId2' },
                { categoryId: 'catId2', optionId: 'catOptionId4' },
            ],
            categoryOptionIds: ['catOptionId2', 'catOptionId4'],
            categoryComboId: 'catComboId1',
        },
    },
}

beforeEach(() => {
    useAppContext.mockImplementation(() => ({
        dataApprovalWorkflows: mockWorkflows,
        organisationUnits: mockOrgUnitRoots,
        metadata: mockMetadata,
    }))
    readQueryParams.mockImplementation(() => ({}))
})

afterEach(() => {
    jest.resetAllMocks()
})

describe('<AttributeComboSelect>', () => {
    it('is hidden if a workflow and a period are not selected', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: null,
            period: {},
            orgUnit: {},
            attributeOptionCombo: {},
            openedSelect: '',
            selectAttributeCombo: () => {},
            selectAttributeOptionCombo: () => {},
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<AttributeComboSelect />)
        const contextSelect = wrapper.find(ContextSelect)

        expect(contextSelect.exists()).toBe(false)
    })

    it('is hidden if a period is not set', () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: null,
            orgUnit: null,
            attributeOptionCombo: {},
            openedSelect: '',
            selectAttributeOptionCombo: () => {},
            selectPeriod: () => {},
            setOpenedSelect: () => {},
        }))
        const wrapper = shallow(<AttributeComboSelect />)
        const contextSelect = wrapper.find(ContextSelect)

        expect(contextSelect.exists()).toBe(false)
    })

    it('is visible if a workflow and a period are set', async () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {
                id: '20120402',
            },
            orgUnit: null,
            attributeOptionCombo: null,
            openedSelect: 'CAT_OPTION_COMBO',
            selectAttributeOptionCombo: () => {},
            selectAttributeCombo: () => {},
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
            attributeCombo: mockMetadata.categoryCombos['catComboId1'],
            isVisible: true,
            attributeCombos: null,
            attrComboValue: '0 selections',
        }))

        const wrapper = mount(<AttributeComboSelect />)

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0))
            wrapper.update()
        })

        const contextSelect = wrapper.find(ContextSelect)
        expect(contextSelect.exists()).toBe(true)
        expect(contextSelect.prop('placeholder')).toBe('0 selections')
    })

    it('is visible if only one attribute option combo exists or valid', async () => {
        useSelectionContext.mockImplementation(() => ({
            workflow: mockWorkflows[0],
            period: {
                id: '20120402',
            },
            orgUnit: null,
            attributeOptionCombo: null,
            openedSelect: 'CAT_OPTION_COMBO',
            selectAttributeOptionCombo: () => {},
            selectAttributeCombo: () => {},
            selectWorkflow: () => {},
            setOpenedSelect: () => {},
            attributeCombo: mockMetadata.categoryCombos['catComboId1'],
            isVisible: true,
            attributeCombos: null,
            attrComboValue: '0 selections',
        }))

        const wrapper = mount(<AttributeComboSelect />)

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0))
            wrapper.update()
        })

        const contextSelect = wrapper.find(ContextSelect)
        expect(contextSelect.exists()).toBe(true)
        expect(wrapper.find(ContextSelect).exists()).toBe(true)
        expect(contextSelect.prop('placeholder')).toBe('0 selections')
    })
})
