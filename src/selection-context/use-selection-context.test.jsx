import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { useAppContext } from '../app-context/index.js'
import { pushStateToHistory } from '../navigation/push-state-to-history.js'
import { readQueryParams } from '../navigation/read-query-params.js'
import { SelectionProvider } from './selection-provider.jsx'
import { useSelectionContext } from './use-selection-context.js'

jest.mock('../navigation/push-state-to-history.js', () => ({
    pushStateToHistory: jest.fn(),
}))

jest.mock('../navigation/read-query-params.js', () => ({
    readQueryParams: jest.fn(),
}))

jest.mock('../app-context/index.js', () => ({
    useAppContext: jest.fn(),
}))

// expect.any(Object) works with `null`, exect.any(String) does not
expect.extend({
    string(received) {
        const message = () =>
            `expected null or string, but received ${this.utils.printReceived(
                received
            )}`

        if (received === null) {
            return { pass: true, message }
        }

        const pass = typeof received == 'string' || received instanceof String
        return { pass, message }
    },
})

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
            startDate: '2010-01-01T00:00:00',
            endDate: '2025-12-01T00:00:00',
            displayName: 'Category Option 1',
            organisationUnits: [
                { id: 'ouId1', path: '/ouId1' },
                { id: 'ouId2', path: '/ouId2' },
            ],
        },
        catOptionId2: {
            id: 'catOptionId2',
            startDate: '2010-01-01T00:00:00',
            endDate: '2025-12-01T00:00:00',
            displayName: 'Category Option 2',
            organisationUnits: [
                { id: 'ouId1', path: '/ouId1' },
                { id: 'ouId2', path: '/ouId2' },
            ],
        },
        catOptionId3: {
            id: 'catOptionId3',
            startDate: '2010-01-01T00:00:00',
            endDate: '2025-12-01T00:00:00',
            displayName: 'Category Option 3',
            organisationUnits: [
                { id: 'ouId1', path: '/ouId1' },
                { id: 'ouId2', path: '/ouId2' },
            ],
        },
        catOptionId4: {
            id: 'catOptionId4',
            startDate: '2010-01-01T00:00:00',
            endDate: '2025-12-01T00:00:00',
            displayName: 'Category Option 4',
            organisationUnits: [
                { id: 'ouId1', path: '/ouId1' },
                { id: 'ouId2', path: '/ouId2' },
            ],
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

const dataSetOne = {
    name: 'Data set 1',
    id: 'dataset_1',
    periodType: 'Daily',
    categoryCombo: {
        id: 'catComboId1',
    },
    organisationUnits: [
        { id: 'ouId1', path: '/ouId1' },
        { id: 'ouId2', path: '/ouId1' },
    ],
}
const dataSetTwo = {
    name: 'Data set 2',
    id: 'dataset_2',
    periodType: 'Daily',
    categoryCombo: {
        id: 'catComboId1',
    },
    organisationUnits: [
        { id: 'ouId1', path: '/ouId1' },
        { id: 'ouId2', path: '/ouId1' },
    ],
}
const mockWorkflows = [
    {
        displayName: 'Workflow a',
        id: 'i5m0JPw4DQi',
        periodType: 'Daily',
        dataSets: [dataSetOne],
    },
    {
        displayName: 'Workflow B',
        id: 'rIUL3hYOjJc',
        periodType: 'Daily',
        dataSets: [dataSetTwo],
    },
]

beforeEach(() => {
    useAppContext.mockImplementation(() => ({
        dataApprovalWorkflows: mockWorkflows,
        metadata: mockMetadata,
    }))
    readQueryParams.mockImplementation(() => ({}))
})

afterEach(() => {
    jest.resetAllMocks()
})

describe('useSelectionContext', () => {
    const wrapper = ({ children }) => (
        <SelectionProvider>{children}</SelectionProvider>
    )

    it('returns the expected properties', () => {
        const { result } = renderHook(() => useSelectionContext(), { wrapper })

        expect(result.current).toEqual({
            workflow: null,
            period: null,
            orgUnit: null,
            attributeCombo: undefined,
            attributeOptionCombo: undefined,
            dataSet: null,
            openedSelect: expect.any(String),
            clearAll: expect.any(Function),
            setOpenedSelect: expect.any(Function),
            selectWorkflow: expect.any(Function),
            selectPeriod: expect.any(Function),
            selectOrgUnit: expect.any(Function),
            selectAttributeCombo: expect.any(Function),
            selectAttributeOptionCombo: expect.any(Function),
            selectDataSet: expect.any(Function),
            attrComboValue: '[No options]',
            attributeCombos: [],
            isVisible: false,
        })
    })

    it('populates properties from query params', () => {
        readQueryParams.mockImplementation(() => ({
            wf: 'rIUL3hYOjJc',
            pe: '20110203',
            ou: '/ouId1',
            aoc: 'catOptionComboId1',
            dataSet: dataSetOne.id,
            ouDisplayName: 'Org unit 1',
        }))

        const { result } = renderHook(() => useSelectionContext(), { wrapper })
        expect(result.current.workflow).toEqual(mockWorkflows[1])
        expect(result.current.period).toEqual(
            expect.objectContaining({
                displayName: '2011-02-03',
                endDate: '2011-02-03',
                id: '20110203',
                iso: '20110203',
                startDate: '2011-02-03',
                year: 2011,
            })
        )
        expect(result.current.orgUnit).toMatchObject({
            id: 'ouId1',
            path: '/ouId1',
        })

        expect(result.current.attributeOptionCombo).toEqual({
            id: 'catOptionComboId1',
            breakdown: [
                { categoryId: 'catId1', optionId: 'catOptionId1' },
                { categoryId: 'catId2', optionId: 'catOptionId3' },
            ],
            categoryOptionIds: ['catOptionId1', 'catOptionId3'],
            categoryComboId: 'catComboId1',
        })
        expect(result.current.dataSet).toEqual('dataset_1')
    })

    describe('functions returned from the hook update the state and url', () => {
        it('setOpenedSelect', () => {
            const mock = jest.fn()
            pushStateToHistory.mockImplementation(mock)

            const { result } = renderHook(() => useSelectionContext(), {
                wrapper,
            })
            // Reset count to 0 because the function is also called on initial render
            mock.mockClear()

            const expectedOpenedSelect = 'test'
            act(() => {
                result.current.setOpenedSelect(expectedOpenedSelect)
            })
            expect(result.current.openedSelect).toEqual(expectedOpenedSelect)
            // Not captured in URL
            expect(mock).toHaveBeenCalledTimes(0)
        })

        it('selectWorkflow', () => {
            const mock = jest.fn()
            pushStateToHistory.mockImplementation(mock)

            const { result } = renderHook(() => useSelectionContext(), {
                wrapper,
            })

            act(() => {
                result.current.selectDataSet(dataSetOne)
            })
            expect(result.current.dataSet.id).toBe(dataSetOne.id)
            mock.mockClear()

            const expectedWorkflow = mockWorkflows[1]
            act(() => {
                result.current.selectWorkflow(expectedWorkflow)
            })
            expect(result.current).toEqual(
                expect.objectContaining({
                    workflow: expectedWorkflow,
                    dataSet: null,
                })
            )
            expect(mock).toHaveBeenCalledTimes(1)
        })

        it('selectPeriod', () => {
            const mock = jest.fn()
            pushStateToHistory.mockImplementation(mock)

            const { result } = renderHook(() => useSelectionContext(), {
                wrapper,
            })

            act(() => {
                result.current.selectDataSet(dataSetOne)
            })
            expect(result.current.dataSet.id).toBe(dataSetOne.id)
            mock.mockClear()

            const expectedPeriod = {
                displayName: 'Feb 02 2021',
                startDate: '2021-02-02',
                endDate: '2021-02-02',
                year: 2021,
                iso: '202102',
                id: '202102',
            }
            act(() => {
                result.current.selectPeriod(expectedPeriod)
            })
            expect(result.current).toEqual(
                expect.objectContaining({
                    period: expectedPeriod,
                    dataSet: null,
                })
            )
            expect(mock).toHaveBeenCalledTimes(1)
        })

        it('selectOrgUnit', () => {
            const mock = jest.fn()
            pushStateToHistory.mockImplementation(mock)
            const { result } = renderHook(() => useSelectionContext(), {
                wrapper,
            })
            act(() => {
                result.current.selectDataSet(dataSetOne)
            })
            expect(result.current.dataSet.id).toBe(dataSetOne.id)
            mock.mockClear()

            const expectedOrgUnit = {
                id: 'ouId1',
                displayName: 'Org unit 1',
                path: '/ouId1',
            }

            act(() => {
                result.current.selectWorkflow(mockWorkflows[1])
                result.current.selectPeriod({
                    displayName: 'Feb 02 2021',
                    startDate: '2021-02-02',
                    endDate: '2021-02-02',
                    year: 2021,
                    iso: '202102',
                    id: '202102',
                })
                result.current.selectOrgUnit(expectedOrgUnit)
            })

            expect(result.current).toEqual(
                expect.objectContaining({
                    orgUnit: expectedOrgUnit,
                    dataSet: null,
                })
            )
            expect(mock).toHaveBeenCalledTimes(1)
        })

        it('selectAttributeOptionCombo', () => {
            const mock = jest.fn()
            pushStateToHistory.mockImplementation(mock)

            const { result } = renderHook(() => useSelectionContext(), {
                wrapper,
            })

            // Reset count to 0 because the function is also called on initial render
            mock.mockClear()

            const expectedCategoryOptionCombo =
                mockMetadata.categoryOptionCombos['catOptionComboId1']
            act(() => {
                result.current.selectWorkflow(mockWorkflows[1])
                result.current.selectPeriod({
                    displayName: 'Feb 02 2021',
                    startDate: '2021-02-02',
                    endDate: '2021-02-02',
                    year: 2021,
                    iso: '202102',
                    id: '202102',
                })
                result.current.selectOrgUnit({
                    id: 'ouId1',
                    displayName: 'Org unit 1',
                    path: '/ouId1',
                })
                result.current.selectAttributeCombo(
                    mockMetadata.categoryCombos['catComboId1']
                )
                result.current.selectAttributeOptionCombo(
                    mockMetadata.categoryOptionCombos['catOptionComboId1']
                )
            })
            expect(result.current.attributeOptionCombo).toEqual(
                expectedCategoryOptionCombo
            )
            expect(mock).toHaveBeenCalledTimes(1)
        })

        it('selectDataSet', () => {
            const mock = jest.fn()
            pushStateToHistory.mockImplementation(mock)

            const { result } = renderHook(() => useSelectionContext(), {
                wrapper,
            })

            // Reset count to 0 because the function is also called on initial render
            mock.mockClear()

            act(() => {
                result.current.selectDataSet(dataSetOne)
            })
            expect(result.current.dataSet.id).toBe(dataSetOne.id)

            expect(mock).toHaveBeenCalledTimes(1)
        })

        it('clearAll', () => {
            const mock = jest.fn()
            readQueryParams.mockImplementation(() => ({
                wf: 'i5m0JPw4DQi',
                pe: '20120402',
            }))
            pushStateToHistory.mockImplementation(mock)

            const { result } = renderHook(() => useSelectionContext(), {
                wrapper,
            })
            // Reset count to 0 because the function is also called on initial render
            mock.mockClear()

            expect(result.current.workflow).toEqual(mockWorkflows[0])
            expect(result.current.period).toEqual(
                expect.objectContaining({
                    displayName: '2012-04-02',
                    endDate: '2012-04-02',
                    id: '20120402',
                    iso: '20120402',
                    startDate: '2012-04-02',
                    year: 2012,
                })
            )

            act(() => {
                result.current.clearAll()
            })
            expect(result.current.openedSelect).toEqual('')
            expect(result.current.workflow).toEqual(null)
            expect(result.current.period).toEqual(null)
            expect(result.current.orgUnit).toEqual(null)
            expect(result.current.attributeOptionCombo).toEqual(null)
            expect(mock).toHaveBeenCalledTimes(1)
        })
    })
})
