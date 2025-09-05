import React, { useState } from 'react';
import { Box, IconButton, Text as Typography, useTheme } from '@chakra-ui/react';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';

type TOnClickHandler = React.MouseEventHandler<HTMLButtonElement>;

interface ITablePaginationProps {
  count: number;
  onChangePage: (page: number) => void;
  page: number;
  rowsPerPage: number;
  setPageSize:any;
}

const TablePagination: React.FC<ITablePaginationProps> = (props) => {
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage,setPageSize } = props;
   const [pageNumber,setpageNum]=useState(10)
  const handleFirstPageButtonClick: TOnClickHandler = () => {
    onChangePage(0);
  };

  const handleBackButtonClick: TOnClickHandler = () => {
    onChangePage(page - 1);
  };
  const handleOnChangePageSize =(val:any)=>{
    setPageSize(val);
    setpageNum(val);
  }
  const handleNextButtonClick: TOnClickHandler = () => {
    onChangePage(page + 1);
  };

  const handleLastPageButtonClick: TOnClickHandler = () => {
    onChangePage(Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        marginLeft: 2,
        gap:'30px',
        justifyContent:'center',
        alignItems:'center'
      }}
    >
      <Box>
      <Typography component="span"  sx={{ color:'#6F6E84' }}>
        Rows per page:
      </Typography>
      <select  value={pageNumber} className='rowperpage' onChange={e => handleOnChangePageSize(e.target.value)}>
        <option value="10">10</option>
        <option value="20">20</option>
      </select>
      </Box>
      <Typography component="span" >
        {page + 1} of {Math.ceil(count)}
      </Typography>
      <Box>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <MdKeyboardArrowRight /> : <MdKeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <MdKeyboardArrowLeft /> : <MdKeyboardArrowRight />}
      </IconButton>
      </Box>
    </Box>
  );
};

export default TablePagination;
