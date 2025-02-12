import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { useStyles, useStyle } from './styles'
import { columns, Data } from './Variables'
import { fetchCreatorAsAdmin } from '../../../reducers/admin/Social/creator/service'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectAuthState } from '../../../../user/reducers/auth/selector'
import { selectCreatorsState } from '../../../reducers/admin/Social/creator/selector'
import TablePagination from '@material-ui/core/TablePagination'

interface Props {
  fetchCreatorAsAdmin?: () => void
  authState?: any
  creatorState?: any
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchCreatorAsAdmin: bindActionCreators(fetchCreatorAsAdmin, dispatch)
})

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    creatorState: selectCreatorsState(state)
  }
}

const CreatorTable = (props: Props) => {
  const { fetchCreatorAsAdmin, authState, creatorState } = props
  const classx = useStyles()
  const classes = useStyle()
  const user = authState.get('user')
  const creator = creatorState.get('creator')
  const creatorData = creator.get('creator')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(12)

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  React.useEffect(() => {
    if (creator.get('updateNeeded')) {
      fetchCreatorAsAdmin()
    }
  }, [creator])

  React.useEffect(() => {
    if (user.id) {
      fetchCreatorAsAdmin()
    }
  }, [user])

  const createData = (
    id: string,
    name: string,
    username: string,
    email: string,
    link: string,
    description: any,
    avatarId: string,
    socialMedia: string
  ): Data => {
    return {
      id,
      name,
      username,
      email,
      link,
      description,
      avatarId,
      socialMedia,
      action: (
        <>
          <a href="#h" className={classes.actionStyle}>
            <span className={classes.spanWhite}>View</span>
          </a>
          <a href="#h" className={classes.actionStyle}>
            {' '}
            <span className={classes.spanDange}>Delete</span>{' '}
          </a>
        </>
      )
    }
  }

  const rows = creatorData.map((el) => {
    return createData(
      el.id,
      el.name || <span className={classes.spanNone}>None</span>,
      el.username || <span className={classes.spanNone}>None</span>,
      el.email || <span className={classes.spanNone}>None</span>,
      el.link || <span className={classes.spanNone}>None</span>,
      el.bio || <span className={classes.spanNone}>None</span>,
      el.avatarId || <span className={classes.spanNone}>None</span>,
      el.twitter || <span className={classes.spanNone}>None</span>
    )
  })

  const count = rows.size ? rows.size : rows.length

  return (
    <div className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  className={classx.tableCellHeader}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, id) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                  {columns.map((column) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={column.id} align={column.align} className={classx.tableCellBody}>
                        {value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[12]}
        component="div"
        count={count || 12}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        className={classx.tableFooter}
      />
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatorTable)
