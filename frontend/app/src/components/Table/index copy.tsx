import React, { useState } from 'react';
import { useTable, Column, useFilters, useSortBy, usePagination } from 'react-table';
import { SkeletonText, Td, Tr,Table as MuiTable, Thead, Th, Tbody, Box, TableContainer  } from '@chakra-ui/react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import TablePagination from './tablepasignation';

const Table = <D extends any>({ columns, data,shortby }: { columns: Column<any>[]; data: D[],shortby?:string }) => {
  const [shortByGroup,setshortByGroup]=useState({
    id: shortby??'usd',
    desc: true,
  })
  const {
    getTableProps,
    headerGroups,
    page,
    prepareRow,
    gotoPage,
    pageCount,
    setPageSize,
    state: { pageIndex },
    setSortBy,
  } = useTable<any>(
    // ? cannot solve this type error for columns 😪
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: 10,
        sortBy: [
          shortByGroup,
        ],
      },
      autoResetPage: false,
      autoResetExpanded: false,
      autoResetGroupBy: false,
      autoResetSelectedRows: false,
      autoResetSortBy: false,
      autoResetFilters: false,
      autoResetRowState: false,
    },
    useFilters,
    useSortBy,
    usePagination,
  );
  const shortByHandler=(sortByAtt: any)=>{
    const currentShortBy={...shortByGroup};
    if(currentShortBy.id === sortByAtt){
      currentShortBy.desc=!currentShortBy.desc;
      setshortByGroup(currentShortBy);
      setSortBy([currentShortBy]);

    }else{
       setshortByGroup({
        id: sortByAtt,
        desc: true,
      });
      setSortBy([{
        id: sortByAtt,
        desc: true,
      }])
    }
  }
  const simmerLoaderScreen=(numberOfLoaders:number)=>{
  //   const skeleton=Array(10).fill(0).map( i => {
  //   return <TableRow sx={{p:1,m:1}} > <Skeleton variant="rectangular" width={''}  height={10} /></TableRow>
  // })

  const skeletom= headerGroups.map((headerGroup) => (
    // eslint-disable-next-line react/jsx-key
    <Tr {...headerGroup.getHeaderGroupProps()}>
      {headerGroup.headers.map((column) => (
        // eslint-disable-next-line react/jsx-key
        <Td {...column.getHeaderProps()} sx={{borderColor:'rgba(255, 255, 255, 0.15)'}}>
          <div className="flex flex-row align-items-center">
          <SkeletonText variant="rectangular" width=''  height={10} />
          </div>
        </Td>
      ))}
    </Tr>
  ))
     return Array(numberOfLoaders).fill(0).map( i => skeletom);
  }
  return (
    <>
    <div>
    <TableContainer
      textAlign='center'
   >
      <div className='tableouverdir'>
     
        <MuiTable {...getTableProps()} className='bridgenewtable' variant='simple'>
          <Thead>
            {headerGroups.map((headerGroup) => (
              // eslint-disable-next-line react/jsx-key
              <Th {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  // eslint-disable-next-line react/jsx-key
                  <Td isNumeric {...column.getHeaderProps()} sx={{
                    borderColor:'rgba(255, 255, 255, 0.15)',
                    display:{xs:(Object.prototype.hasOwnProperty.call(column, "xsShow"))?'table-cell':'none',sm:'table-cell'}}}>
                    <div className="flex flex-row align-items-center" >
                      <span className="mx-1" style={{display:'flex'}} >{column.render('Header')}
                      {shortByGroup.id===column.id?shortByGroup.desc?<MdKeyboardArrowDown/>:<MdKeyboardArrowUp/>:<MdKeyboardArrowUp opacity={0} />}
                      
                      </span>
                    </div>
                  </Td>
                ))}
              </Th>
            ))}
          </Thead>
          <Tbody sx={{ fontSize: '1.15rem' }}>
            {!data.length ? simmerLoaderScreen(10):null}
            {data.length ? page.map((row) => {
              prepareRow(row);
              return (
                // eslint-disable-next-line react/jsx-key
                <Tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      // eslint-disable-next-line react/jsx-key
                      <Td isNumeric {...cell.getCellProps()} sx={{borderColor:'rgba(255, 255, 255, 0.15)',display:{xs:(Object.prototype.hasOwnProperty.call(cell.column, "xsShow"))?'table-cell':'none',sm:'table-cell'}}}>
                        <span className="mx-1" style={{width:'100px'}}>{cell.render('Cell')}</span>
                      </Td>
                    );
                  })}
                </Tr>
              );
            }):null}
          </Tbody>
        </MuiTable>
        </div>
        <Box className='paginationcontainer'>
          <TablePagination
            count={pageCount}
            rowsPerPage={10}
            page={pageIndex}
            setPageSize={setPageSize}
            onChangePage={(number) => gotoPage(number)}
          />
        </Box>
        </TableContainer>
      </div>
    </>
  );
};

export default Table;