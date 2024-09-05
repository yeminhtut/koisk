import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';

const PrimeTable = (props) => {
    const { 
        list, 
        columns, 
        actionColumn, 
        linkColumn,
        pageSizeChangecallback,
        pageChangeCallback,
        tablePageSize,
        showFilterSearch,
        isSearched
    } = props
    const [first, setFirst] = useState(0)
    const [tableRows, setTableRows] = useState(tablePageSize || 10)
    const [pageSize, setPageSize] = useState(tablePageSize || 10)
    const [currentPage, setCurrentPage] = useState(1)
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    useEffect(() => {
        if (isSearched) {
            setPageSize(tablePageSize || pageSize)
        }
    }, [isSearched])

    const onCustomPage = (event) => {
        setFirst(event.first);
        setTableRows(event.rows);
    };

    const renderActionTemplate = rowData => actionColumn(rowData)

    const renderLinkTemplate = rowData => linkColumn(rowData)

    const resetFilter = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        });
        setGlobalFilterValue('');
    }

    const handleNextPage = () => {
        setCurrentPage( currentPage + 1)
        pageChangeCallback(currentPage + 1)
    }
    const handlePrevPage  = () => {
        setCurrentPage( currentPage - 1)
        pageChangeCallback(currentPage - 1)
    }

    const handlePageSizeChange = (e) => {
        e.preventDefault();
        resetFilter()
        setPageSize(e.target.value);
        setCurrentPage(1);
        setTableRows(e.target.value);
        pageSizeChangecallback(e.target.value)
    };

    const renderPaginationTemplate = {
        layout: 'RowsPerPageDropdown CurrentPageReport',
        RowsPerPageDropdown: (options) => {
            const dropdownOptions = [
                { label: 10, value: 10 },
                { label: 20, value: 20 },
                { label: 50, value: 50 },
            ];

            return (
                <>
                    <span
                        className="mx-1"
                        style={{
                            color: 'var(--text-color)',
                            userSelect: 'none',
                        }}
                    >
                        Items per page:{' '}
                    </span>
                    <Dropdown
                        value={pageSize}
                        options={dropdownOptions}
                        onChange={(e) => handlePageSizeChange(e)}
                    />
                </>
            );
        },
        CurrentPageReport: () => {
            return (
                <div>
                    <button
                        type="button"
                        className={classNames({
                            'p-paginator-prev p-paginator-element p-link': true,
                            'p-disabled': currentPage === 1,
                        })}
                        disabled={currentPage === 1}
                        aria-label="Previous Page"
                        onClick={handlePrevPage}
                    >
                        <span className="p-paginator-icon pi pi-angle-left"></span>
                        <span role="presentation" className="p-ink"></span>
                    </button>
                    <span style={{ padding: '0px 10px 0px 10px'}}>{currentPage}</span>
                    <button
                        type="button"
                        className={classNames({
                            'p-paginator-prev p-paginator-element p-link': true,
                            'p-disabled':
                                list && list.length < pageSize,
                        })}
                        aria-label="Next Page"
                        onClick={handleNextPage}
                    >
                        <span className="p-paginator-icon pi pi-angle-right"></span>
                        <span role="presentation" className="p-ink"></span>
                    </button>
                </div>
            );
        },
    };

    const getSearchAction = () => {
        if (globalFilterValue) {
            return (
                <i
                    className="pi pi-times-circle"
                    onClick={resetFilter}
                    style={{ cursor: 'pointer' }}
                />
            );
        }
        return <i className="pi pi-search" />
    }

    const renderSearchHeader = () => {
        if (!showFilterSearch) {
            return <></>
        }
        return (
            <div
                className="flex"
                style={{ justifyContent: 'flex-end', marginBottom: '20px' }}
            >
                <div>
                    <span className="p-input-icon-right">
                        {getSearchAction()}
                        <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Search"
                        />
                    </span>
                </div>
            </div>
        );
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    return (
        <>
            {renderSearchHeader()}
            <DataTable
                value={list}
                showGridlines
                columnResizeMode="fit"
                responsiveLayout="scroll"
                paginatorClassName="justify-content-end"
                paginatorTemplate={renderPaginationTemplate}
                paginator
                first={first}
                rows={tableRows}
                onPage={onCustomPage}
                emptyMessage="Your search does not retrieve any data. Please search again using another criteria."
                filters={filters}
                style={{ wordBreak: 'break-word'}}
            >
                {props.children}
                {columns.map((column) => {
                    return (
                        <Column
                        key={column.field}
                        field={column.field}
                        header={column.header}
                        sortable={column.sortable}
                        style={{ width: column.width}}
                    />
                    )
                })}
                {actionColumn && (
                    <Column
                        header="Actions"
                        body={renderActionTemplate}
                    />
                )}
                {linkColumn && (
                    <Column
                        header=""
                        body={renderLinkTemplate}
                    />
                )}
            </DataTable>
        </>
    );
};

export default PrimeTable;
