const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const myDB = new sqlite3.Database('./database.db');

myDB.run(`
  CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title text,
      completed boolean default 0
    )
`);

router.post('/', (req, res) => {
    const {title} = req.body;
    const sql = 'INSERT INTO tasks (title) values (?)';

    myDB.run(sql, [title], function(err) {
      if(err){
        return res.status(404).json({message:"error in task creation"});
      }
      else {
        res.status(202).json({
          message:"Task created successfully",
          task:{id:this.lastId, title, completed: "nope"}
      })
    }
  })
});

router.get('/', (req, res) => {
  myDB.all('SELECT * from tasks', [], (err,rows) => {
      if(err){
        return res.status(404).json({message:"No database(entries) were found"});
      }
      else{
        res.status(202).json(rows);
      }
  })
});

router.get('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);

  myDB.all('SELECT * from tasks where id=?', [taskId], (err,row) => {
    if(err || !row){
      return res.status(404).json({message:"No entry with id #"+taskId+" was found"});
    }
    else{
      res.status(202).json(row);
    }
  })
});

router.put('/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  const {title, completed} = req.body;

  const sql = 'UPDATE tasks SET title = COALESCE(?, title), completed = COALESCE(?, completed) WHERE id = ?';

  myDB.run(sql, [title, completed, itemId], function(err) {
    if (err || this.changes==0) {
      return res.status(500).json({ error:"No entry was found with id #"+itemId});
    }
    res.status(204).json({ message: "Task updated successfully", id: itemId });
  });
});


router.delete('/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const sql = "DELETE FROM tasks where id = ?";

  myDB.run(sql, [taskId], function(err){
    if(err || this.changes==0){
        res.status(404).json({message:"Couldn't find that task"});
    }
    else{
      res.status(204).json({ message: 'Task #'+taskId+' deleted successfully'});
    }
  })
});

module.exports = router;