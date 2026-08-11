import { useDataQuery } from "@dhis2/app-runtime";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";

const ORG_UNIT_QUERY = {
    orgUnits: {
        resource: "organisationUnits",
        params: ({ searchText }) => ({
            fields: [
                "id,displayName,path"
            ].join(","),
            paging: true,
            query: searchText,
            withinUserSearchHierarchy: true,
            pageSize: 15,
        })
    }
}

export const useOrgUnitSearch = () => {
    const [searchText, setSearchText] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("") // Debounced value

    const { loading, data, refetch } = useDataQuery(ORG_UNIT_QUERY, { lazy: true })

    // Update debouncedSearch after a delay
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchText) // Update only after delay
        }, 1000); // Wait 1s before updating

        return () => clearTimeout(handler) // Cleanup on re-render
    }, [searchText]); // Runs only when `searchText` changes

    // Update debouncedSearch after a delay
    useEffect(() => {
        refetch({ searchText: debouncedSearch })
    }, [debouncedSearch])


    return {
        searchText,
        setSearchText,
        orgUnits: data?.orgUnits?.organisationUnits || [],
        loading,
    }
}
