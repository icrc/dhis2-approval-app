import { CustomDataProvider } from '@dhis2/app-runtime'
import {
    render,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { useAppContext } from '../../app-context/index.js'
import { SelectionContext } from '../../selection-context/index.js'
import { Display } from './display.jsx'

jest.mock('../../app-context/index.js', () => ({
    useAppContext: jest.fn(),
}))

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
            organisationUnits: [
                { id: 'ouId1', path: '/ouId1' },
                { id: 'ouId2', path: '/ouId2' },
            ],
        },
        catOptionId2: {
            id: 'catOptionId2',
            startDate: '2024-01-01T00:00:00',
            endDate: '2024-12-01T00:00:00',
            displayName: 'Category Option 2',
            organisationUnits: [
                { id: 'ouId1', path: '/ouId1' },
                { id: 'ouId2', path: '/ouId2' },
            ],
        },
        catOptionId3: {
            id: 'catOptionId3',
            startDate: '2024-01-01T00:00:00',
            endDate: '2024-12-01T00:00:00',
            displayName: 'Category Option 3',
            organisationUnits: [
                { id: 'ouId1', path: '/ouId1' },
                { id: 'ouId2', path: '/ouId2' },
            ],
        },
        catOptionId4: {
            id: 'catOptionId4',
            startDate: '2024-01-01T00:00:00',
            endDate: '2024-12-01T00:00:00',
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

beforeEach(() => {
    useAppContext.mockImplementation(() => ({
        metadata: mockMetadata,
    }))
})

afterEach(() => {
    jest.resetAllMocks()
})

describe('<Display>', () => {
    const dataSetOne = {
        displayName: 'Mortality < 5 years',
        id: 'pBOMPrpg1QX',
        periodType: 'Monthly',
        categoryCombo: {
            id: 'catComboId1',
        },
        organisationUnits: [
            { id: 'ouId1', path: '/ouId1' },
            { id: 'ouId2', path: '/ouId2' },
        ],
    }

    const dataSetTwo = {
        displayName: 'Mortality > 4 years',
        id: 'pBOMPrpg1QZ',
        periodType: 'Monthly',
        categoryCombo: {
            id: 'catComboId1',
        },
        organisationUnits: [
            { id: 'ouId1', path: '/ouId1' },
            { id: 'ouId2', path: '/ouId2' },
        ],
    }

    it('asks the user to select a data set if none is selected', () => {
        render(
            <CustomDataProvider options={{ loadForever: true }}>
                <SelectionContext.Provider
                    value={{
                        workflow: {
                            dataApprovalLevels: [],
                            dataSets: [dataSetOne, dataSetTwo],
                            displayName: 'Workflow 1',
                            id: 'foo',
                            periodType: 'Monthly',
                        },
                        period: {
                            displayName: 'January 2021',
                            startDate: '2021-01-01',
                            endDate: '2021-01-31',
                            iso: '202101',
                            id: '202101',
                        },
                        orgUnit: {
                            id: 'ouId2',
                            displayName: 'Org unit 2',
                            path: '/ouId2',
                        },
                        attributeCombo:
                            mockMetadata.categoryCombos['catComboId1'],
                        attributeOptionCombo:
                            mockMetadata.categoryOptionCombos[
                                'catOptionComboId1'
                            ],
                        isShowed: true,
                        attrComboValue: '2 selections',
                        openedSelect: 'CAT_OPTION_COMBO',
                    }}
                >
                    <Display dataSetId={null} />
                </SelectionContext.Provider>
            </CustomDataProvider>
        )

        expect(screen.getByRole('heading')).toHaveTextContent(
            'Choose a data set to review'
        )
        expect(
            screen.getByText(
                `Workflow 1 has multiple data sets. Choose a data set from the tabs above.`
            )
        ).toBeInTheDocument()
    })

    it('shows a message if the workflow has no data sets', () => {
        render(
            <CustomDataProvider options={{ loadForever: true }}>
                <SelectionContext.Provider
                    value={{
                        workflow: {
                            dataApprovalLevels: [],
                            dataSets: [],
                            displayName: 'Workflow 1',
                            id: 'foo',
                            periodType: 'Monthly',
                        },
                        period: {
                            displayName: 'January 2021',
                            startDate: '2021-01-01',
                            endDate: '2021-01-31',
                            iso: '202101',
                            id: '202101',
                        },
                        orgUnit: {
                            id: 'ouId2',
                            displayName: 'Org unit 2',
                            path: '/ouId2',
                        },
                        attributeCombo: null,
                        attributeOptionCombo: null,
                    }}
                >
                    <Display dataSetId={null} />
                </SelectionContext.Provider>
            </CustomDataProvider>
        )
        expect(
            screen.getByText(
                `Workflow "Workflow 1", organisation unit "Org unit 2" and attribute option combo "" does not contain any data sets.`
            )
        ).toBeInTheDocument()
    })

    it('renders a loading spinner if a data set is selected', () => {
        render(
            <CustomDataProvider options={{ loadForever: true }}>
                <SelectionContext.Provider
                    value={{
                        attributeCombo:
                            mockMetadata.categoryCombos['catComboId1'],
                        attributeOptionCombo:
                            mockMetadata.categoryOptionCombos[
                                'catOptionComboId1'
                            ],
                        orgUnit: {
                            id: 'ouId2',
                            path: '/ouId2',
                        },
                        period: {
                            displayName: 'January 2021',
                            startDate: '2021-01-01',
                            endDate: '2021-01-31',
                            year: 2021,
                            iso: '202101',
                            id: '202101',
                        },
                        workflow: {
                            dataSets: [dataSetOne, dataSetTwo],
                            dataApprovalLevels: [],
                            displayName: 'Workflow 1',
                            periodType: 'Monthly',
                            id: 'foo',
                        },
                    }}
                >
                    <Display dataSetId="pBOMPrpg1QX" />
                </SelectionContext.Provider>
            </CustomDataProvider>
        )

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
        expect(screen.getByText('Loading data set')).toBeInTheDocument()
    })

    it('shows an error notice with a retry button if there was an error fetching the data set report', async () => {
        const data = {}
        render(
            <CustomDataProvider data={data}>
                <SelectionContext.Provider
                    value={{
                        attributeCombo:
                            mockMetadata.categoryCombos['catComboId1'],
                        attributeOptionCombo:
                            mockMetadata.categoryOptionCombos[
                                'catOptionComboId1'
                            ],
                        orgUnit: {
                            id: 'ouId2',
                            path: '/ouId2',
                        },
                        period: {
                            displayName: 'January 2021',
                            startDate: '2021-01-01',
                            endDate: '2021-01-31',
                            year: 2021,
                            iso: '202101',
                            id: '202101',
                        },
                        workflow: {
                            dataSets: [dataSetOne, dataSetTwo],
                            dataApprovalLevels: [],
                            displayName: 'Workflow 1',
                            periodType: 'Monthly',
                            id: 'foo',
                        },
                    }}
                >
                    <Display dataSetId="pBOMPrpg1QX" />
                </SelectionContext.Provider>
            </CustomDataProvider>
        )

        await waitFor(() => screen.getByRole('heading'))

        expect(screen.getByRole('heading')).toHaveTextContent(
            'There was a problem displaying this data set'
        )
        expect(
            screen.getByText(
                `This data set couldn't be loaded or displayed. Try again, or contact your system administrator.`
            )
        ).toBeInTheDocument()
        expect(screen.getByRole('button')).toHaveTextContent(
            'Retry loading data set'
        )

        data.dataSetReport = []
        await userEvent.click(
            screen.getByRole('button', 'Retry loading data set')
        )
        // Not really possible to catch the progress bar before the next assertion

        await waitFor(() => {
            expect(
                screen.queryByRole(
                    'heading',
                    'There was a problem displaying this data set'
                )
            ).not.toBeInTheDocument()
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
        })
    })

    it('shows a message if the data set report has no data for the seleted period and organisation unit', async () => {
        const data = {
            dataSetReport: [],
        }
        render(
            <CustomDataProvider data={data}>
                <SelectionContext.Provider
                    value={{
                        attributeCombo:
                            mockMetadata.categoryCombos['catComboId1'],
                        attributeOptionCombo:
                            mockMetadata.categoryOptionCombos[
                                'catOptionComboId1'
                            ],
                        orgUnit: {
                            id: 'ouId2',
                            path: '/ouId2',
                            displayName: 'Org unit 2',
                        },
                        period: {
                            displayName: 'January 2021',
                            startDate: '2021-01-01',
                            endDate: '2021-01-31',
                            year: 2021,
                            iso: '202101',
                            id: '202101',
                        },
                        workflow: {
                            dataSets: [dataSetOne, dataSetTwo],
                            dataApprovalLevels: [],
                            displayName: 'Workflow 1',
                            periodType: 'Monthly',
                            id: 'foo',
                        },
                    }}
                >
                    <Display dataSetId="pBOMPrpg1QX" />
                </SelectionContext.Provider>
            </CustomDataProvider>
        )

        await waitForElementToBeRemoved(() => screen.getByRole('progressbar'))

        expect(
            screen.getByText(
                `This data set doesn't have any data for January 2021 in Org unit 2.`
            )
        ).toBeInTheDocument()
    })

    describe('display for custom datasets', () => {
        it('renders a table for a custom dataset with safely sanitised HTML and CSS', async () => {
            const data = {
                dataSetReport: [
                    {
                        title: 'Custom Data set',
                        headers: [
                            {
                                name: '<b><span style="color:#00b050">2024/25</span></b>',
                                column: '<b><span style="color:#00b050">2024/25</span></b>',
                                type: 'java.lang.String',
                                hidden: false,
                                meta: false,
                            },
                            {
                                name: '<span style="color:black">NATIONAL DEPARTMENT OF HEALTH</span>',
                                column: '<span style="color:black">NATIONAL DEPARTMENT OF HEALTH</span>',
                                type: 'java.lang.String',
                                hidden: false,
                                meta: false,
                            },
                        ],
                        rows: [
                            [
                                '<span style="color:black">Programme 6: Performance Indicator</span>',
                            ],
                        ],
                    },
                ],
            }
            render(
                <CustomDataProvider data={data}>
                    <SelectionContext.Provider
                        value={{
                            attributeCombo:
                                mockMetadata.categoryCombos['catComboId1'],
                            attributeOptionCombo:
                                mockMetadata.categoryOptionCombos[
                                    'catOptionComboId1'
                                ],
                            orgUnit: {
                                id: 'ouId2',
                                path: '/ouId2',
                            },
                            period: {
                                displayName: 'January 2021',
                                startDate: '2021-01-01',
                                endDate: '2021-01-31',
                                year: 2021,
                                iso: '202101',
                                id: '202101',
                            },
                            workflow: {
                                dataSets: [
                                    {
                                        displayName: 'Another',
                                        id: 'custom',
                                        periodType: 'Monthly',
                                        formType: 'CUSTOM',
                                        categoryCombo: {
                                            id: 'catComboId1',
                                        },
                                        organisationUnits: [
                                            {
                                                id: 'ou-1',
                                                path: '/ou-1',
                                            },
                                            {
                                                id: 'ouId2',
                                                path: '/ouId2',
                                            },
                                        ],
                                    },
                                ],
                                dataApprovalLevels: [],
                                displayName: 'Workflow 1',
                                periodType: 'Monthly',
                                id: 'foo',
                            },
                        }}
                    >
                        <Display dataSetId="custom" />
                    </SelectionContext.Provider>
                </CustomDataProvider>
            )

            await waitForElementToBeRemoved(() =>
                screen.getByRole('progressbar')
            )

            expect(screen.getByText('2024/25')).toHaveStyle({
                color: 'rgb(0, 176, 80)',
            })
            expect(screen.getByText('2024/25').parentElement.tagName).toBe('B')

            expect(
                screen.getByText('NATIONAL DEPARTMENT OF HEALTH')
            ).toHaveStyle({
                color: 'black',
            })

            expect(
                screen.getByText('Programme 6: Performance Indicator')
            ).toHaveStyle({
                color: 'black',
            })
        })

        it('renders HTML and CSS encoded for non-custom dataset', async () => {
            const data = {
                dataSetReport: [
                    {
                        title: 'Custom Data set',
                        headers: [
                            {
                                name: '<span style="color:black">NATIONAL DEPARTMENT OF HEALTH</span>',
                                column: '<span style="color:black">NATIONAL DEPARTMENT OF HEALTH</span>',
                                type: 'java.lang.String',
                                hidden: false,
                                meta: false,
                            },
                        ],
                        rows: [['DE Test 1', 12]],
                    },
                ],
            }
            render(
                <CustomDataProvider data={data}>
                    <SelectionContext.Provider
                        value={{
                            attributeCombo:
                                mockMetadata.categoryCombos['catComboId1'],
                            attributeOptionCombo:
                                mockMetadata.categoryOptionCombos[
                                    'catOptionComboId1'
                                ],
                            orgUnit: {
                                id: 'ouId2',
                                path: '/ouId2',
                            },
                            period: {
                                displayName: 'January 2021',
                                startDate: '2021-01-01',
                                endDate: '2021-01-31',
                                iso: '202101',
                                id: '202101',
                            },
                            workflow: {
                                dataSets: [dataSetOne],
                                dataApprovalLevels: [],
                                displayName: 'Workflow 1',
                                periodType: 'Monthly',
                                id: 'foo',
                            },
                        }}
                    >
                        <Display dataSetId="pBOMPrpg1QX" />
                    </SelectionContext.Provider>
                </CustomDataProvider>
            )

            // Wait for loading to finish
            await waitForElementToBeRemoved(() =>
                screen.getByRole('progressbar')
            )

            expect(screen.getByRole('table')).toContainHTML('DE Test 1')
        })
    })
})
