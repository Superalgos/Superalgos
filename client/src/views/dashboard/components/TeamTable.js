import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

let id = 0
const createData = (name, calories, fat, carbs, protein) => {
  id += 1
  return { id, name, calories, fat, carbs, protein }
}

const data = [
  createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
  createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
  createData('Eclair', 262, 16.0, 24, 6.0),
  createData('Cupcake', 305, 3.7, 67, 4.3),
  createData('Gingerbread', 356, 16.0, 49, 3.9)
]

export const TeamTable = () => (
  <Paper>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Dessert (100g serving)</TableCell>
          <TableCell numeric>Calories</TableCell>
          <TableCell numeric>Fat (g)</TableCell>
          <TableCell numeric>Carbs (g)</TableCell>
          <TableCell numeric>Protein (g)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map(n => {
          return (
            <TableRow key={n.id}>
              <TableCell component='th' scope='row'>
                {n.name}
              </TableCell>
              <TableCell numeric>{n.calories}</TableCell>
              <TableCell numeric>{n.fat}</TableCell>
              <TableCell numeric>{n.carbs}</TableCell>
              <TableCell numeric>{n.protein}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  </Paper>
)

export default TeamTable
