import { readQueryParams } from '../navigation/index.js'
import { parsePeriodId } from '../shared/index.js'
import { extractValidCatComboAndCatOptionCombo } from '../utils/category-combo-utils.js'

export const initialValues = (metadata, workflows, calendar) => {
    const queryParams = readQueryParams()
    const {
        wf,
        pe,
        ou,
        aoc,
        ouDisplayName,
        dataSet: dataSetParam,
    } = queryParams

    const workflow = initialWorkflowValue(workflows, wf)
    const period = initialPeriodValue(pe, workflow)
    const orgUnit = initialOrgUnitValue(ou, ouDisplayName)
    const attributeComboData = initialAttributeOptionComboValue(
        {
            aoc,
            period,
            calendar,
            workflow,
        },
        metadata
    )

    const dataSet = initialDataSetValue(dataSetParam)

    return {
        workflow,
        period,
        orgUnit,
        dataSet,
        attributeCombo: attributeComboData?.attributeCombo,
        attributeOptionCombo: attributeComboData?.attributeOptionCombo,
    }
}

export const initialWorkflowValue = (workflows, workflowId) => {
    if (workflows.length === 1) {
        // auto-select if user only has one workflow
        return workflows[0]
    }

    if (workflowId) {
        /*
         * Auto select workflow with query param id
         * default to empty object if `find` returns undefined in case the
         * workflow with the id from the url is not available to the user
         */
        return workflows.find((workflow) => workflow.id === workflowId) || null
    }

    return null
}

export const initialPeriodValue = (periodId, initialWorkflow = {}) => {
    if (!periodId || !initialWorkflow.id) {
        return null
    }

    return parsePeriodId(periodId, [initialWorkflow.periodType])
}

export const initialOrgUnitValue = (path, displayName) => {
    if (!path || !displayName) {
        return null
    }

    const [lastPathSegment] = path.match(/[/]?[^/]*$/)
    const id = lastPathSegment.replace('/', '')
    return { id, path, displayName }
}

export const initialAttributeOptionComboValue = (
    { aoc, period, calendar, workflow = {} },
    metadata = {}
) => {
    if (!aoc || !workflow.id || !metadata.categoryCombos || !period) {
        return null
    }

    return extractValidCatComboAndCatOptionCombo(metadata, {
        workflow,
        aoc,
        period,
        calendar,
    })
}

export const initialDataSetValue = (dataSetParam) => {
    if (!dataSetParam) {
        return null
    }

    return dataSetParam
}
