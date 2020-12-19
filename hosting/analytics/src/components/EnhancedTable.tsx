import React from 'react'
import { connect } from 'react-redux'
import { showIntentDetails } from '../store/actions/configActions'
import { withStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Paper from '@material-ui/core/Paper'
import Tooltip from '@material-ui/core/Tooltip'

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: '1em',
  },
}))(TableCell)

const StyledTableSortLabel = withStyles(() => ({
  root: {
    '&:hover': {
      color: '#eceef8',
    },
    '&:focus': {
      color: '#eceef8',
    },
  },
  active: {
    color: '#fff !important',
    fontWeight: 'bold',
    '&:hover': {
      color: '#d9ddf2',
    },
  },
}))(TableSortLabel)

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map(el => el[0])
}

function getSorting(order, orderBy) {
  return order === 'desc'
    ? (a, b) => desc(a, b, orderBy)
    : (a, b) => -desc(a, b, orderBy)
}


class EnhancedTableHead extends React.Component<any> {
  createSortHandler = property => event => {
    this.props.onRequestSort(event, property)
  }

  render() {
    const { order, orderBy } = this.props

    let columns = [
      {
        id: 'name',
        numeric: false,
        disablePadding: false,
        label: 'Intent Name',
        toolTip: 'Sort by the name of the intent',
      },
      {
        id: 'occurrences',
        numeric: true,
        disablePadding: false,
        label: 'Count',
        toolTip: 'Sort by the number of times the intent was triggered',
      }
    ]

    if (!this.props.selectedSubjectMatter || this.props.selectedSubjectMatter.toLowerCase() !== 'total') {
      columns = [
        ...columns,
        {
          id: 'sessions',
          numeric: true,
          disablePadding: false,
          label: 'Conversations',
          toolTip: 'Sort by the number of conversations in which the intent occurred',
        },
        {
          id: 'exits',
          numeric: true,
          disablePadding: false,
          label: 'Exits',
          toolTip:
            'Sort by the number of times the intent was the last intent of the conversation',
        }
      ]
    }

    return (
      <TableHead>
        <TableRow>
          {columns.map(
            row => (
              <CustomTableCell
                key={row.id}
                align={row.numeric ? 'right' : 'left'}
                padding={row.disablePadding ? 'none' : 'default'}
                sortDirection={orderBy === row.id ? order : false}
              >
                <Tooltip
                  title={row.toolTip}
                  placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                  enterDelay={300}
                >
                  <StyledTableSortLabel
                    active={orderBy === row.id}
                    direction={order}
                    onClick={this.createSortHandler(row.id)}
                  >
                    {row.label}
                  </StyledTableSortLabel>
                </Tooltip>
              </CustomTableCell>
            ),
            this
          )}
        </TableRow>
      </TableHead>
    )
  }
}

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(),
    overflowX: 'auto',
  },
  row: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
})

class EnhancedTable extends React.Component<any> {
  state = {
    order: 'desc',
    orderBy: 'occurrences',
    page: 0,
    rowsPerPage: 10,
  }

  handleRequestSort = (event, property) => {
    const orderBy = property
    let order = 'desc'

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc'
    }

    this.setState({ order, orderBy })
  }

  handleChangePage = (event, page) => {
    this.setState({ page })
  }

  handleChangeRowsPerPage = event => {
    this.setState({ rowsPerPage: event.target.value })
  }

  render() {
    const { order, orderBy, rowsPerPage, page } = this.state
    const { classes } = this.props
    const data = this.props.data
    const emptyRows =
      rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage)

    return (
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table className={classes.table} aria-labelledby='tableTitle'>
            <EnhancedTableHead
              selectedSubjectMatter={this.props.selectedSubjectMatter}
              order={order}
              orderBy={orderBy}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
            />
            <TableBody>
              {stableSort(data, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(row => {
                  return (
                    <TableRow
                      className={classes.row}
                      hover
                      onClick={() => this.props.onIntentSelected(row)}
                      role='checkbox'
                      tabIndex={-1}
                      key={row.id}
                    >
                      <TableCell component='th' scope='row'>
                        {row.name}
                      </TableCell>
                      <TableCell align='right'>{row.occurrences}</TableCell>
                      {(!this.props.selectedSubjectMatter || this.props.selectedSubjectMatter.toLowerCase() !== 'total') && <>
                        <TableCell align='right'>{row.sessions}</TableCell>
                        <TableCell align='right'>{row.exits}</TableCell>
                      </>}
                    </TableRow>
                  )
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page',
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page',
          }}
          onChangePage={this.handleChangePage}
          onChangeRowsPerPage={this.handleChangeRowsPerPage}
        />
      </Paper>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onIntentSelected: intent => dispatch(showIntentDetails(intent)),
  }
}

export default withStyles(styles as any)(
  connect(
    null,
    mapDispatchToProps
  )(EnhancedTable)
)
