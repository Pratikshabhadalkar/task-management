const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');

const secret_key = 'scdscdf';
let tasks = [
  { "id": 1, "name": "Task 1", "dueDate": "2024-08-24", "completed": false },
  { "id": 2, "name": "Task 2", "dueDate": "2024-08-25", "completed": true },
  { "id": 3, "name": "Task 3", "dueDate": "2024-08-26", "completed": true }
]

let currentId = 4;
let users = [
  { id: '1', username: 'admin', password: 'admin123' }
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const path = parsedUrl.pathname;

  
  function handleAuthentication(callback) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'No token provided' }));
    }
    jwt.verify(token, secret_key, (err, decoded) => {
      if (err) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Invalid token' }));
      }
      callback(decoded);
    });
  }
//login
  if (path === '/login' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const user = JSON.parse(body);
        const isUserPresent = users.find(item => item.username === user.username && item.password === user.password);
        if (isUserPresent) {
          const token = jwt.sign({ userId: isUserPresent.id }, secret_key, { expiresIn: '1h' });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ token }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: "User credentials do not match" }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
  } 
  //create task
  else if (path === '/tasks' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const task = JSON.parse(body);
        task.id = currentId++;
        task.history = [];
        task.comments = [];
        task.status = task.status || 'pending';
        tasks.push(task);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(task));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
  } 
  //get all tasks
  else if (path === '/tasks' && method === 'GET') {
    handleAuthentication(() => {
      const { status, priority, category } = parsedUrl.query;
      let filteredTasks = tasks;
      if (status) {
        filteredTasks = filteredTasks.filter(task => task.status === status);
      }
      if (category) {
        filteredTasks = filteredTasks.filter(task => task.category === category);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(filteredTasks));
    });
  }

  //search 
   else if (path === '/tasks/search' && method === 'GET') {
    handleAuthentication(() => {
      const keyword = parsedUrl.query.q ? parsedUrl.query.q.toLowerCase() : '';
      const filteredTasks = tasks.filter(task =>
        (task.title && task.title.toLowerCase().includes(keyword)) ||
        (task.description && task.description.toLowerCase().includes(keyword))
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(filteredTasks));
    });
  } 
  //overdue
  else if (path === '/tasks/overdue' && method === 'GET') {
    handleAuthentication(() => {
      const today = new Date();
      const overdueTasks = tasks.filter(task =>
        new Date(task.dueDate) < today && !task.completed
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(overdueTasks));
    });
  }
 
 //due-soon
  else if (path === '/tasks/due-soon' && method === 'GET') {
    handleAuthentication(() => {
      const days = parseInt(parsedUrl.query.days) || 7; 
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + days);
  
      const dueSoonTasks = tasks.filter(task => {
        const taskDueDate = new Date(task.dueDate);
        return taskDueDate >= today && taskDueDate <= endDate;
      });
  
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(dueSoonTasks));
    });
  }//get all
   else if 
   (path.startsWith('/tasks/') && method === 'GET') {
    const id = parseInt(path.split('/')[2]);
    const task = tasks.find(t => t.id === id);
    if (task) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(task));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Task not found' }));
    }
  } //updatetask
  else if (path.startsWith('/tasks/') && method === 'PUT') {
    const id = parseInt(path.split('/')[2]);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const updatedTask = JSON.parse(body);
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
          if (!tasks[taskIndex].history) {
            tasks[taskIndex].history = []; 
          }
          tasks[taskIndex].history.push({
            timestamp: new Date(),
            changes: updatedTask,
            changedBy: 'user123'
          });
          tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(tasks[taskIndex]));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Task not found' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
  }
  //prioorty
   else if (path.startsWith('/tasks/') && method === 'PATCH' && path.endsWith('/priority')) {
    const id = parseInt(path.split('/')[2]);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { priority } = JSON.parse(body);
        const task = tasks.find(t => t.id === id);
        if (task) {
          if (!task.history) {
            task.history = []; 
          }
          task.history.push({
            timestamp: new Date(),
            changes: { priority },
            changedBy: 'user123'
          });
          task.priority = priority;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(task));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Task not found' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
  } 
  //assign
  else if (path.startsWith('/tasks/') && method === 'PATCH' && path.endsWith('/assign')) {
    const id = parseInt(path.split('/')[2]);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { assignedTo } = JSON.parse(body);
        const task = tasks.find(t => t.id === id);
        if (task) {
          if (!task.history) {
            task.history = []; 
          }
          task.history.push({
            timestamp: new Date(),
            changes: { assignedTo },
            changedBy: 'user123'
          });
          task.assignedTo = assignedTo;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(task));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Task not found' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Invalid JSON" }));
      }
    });
  }

  else if(path.startsWith('/tasks/') && method === 'POST' && path.endsWith('/bulk')) {
    
      let body = '';

      req.on('data', chunk => {
          body += chunk.toString();
      });

      req.on('end', () => {
          try {
              const newTasks = JSON.parse(body);

              if (Array.isArray(newTasks)) {
                  newTasks.forEach(task => {
                      const newTask = {
                          id: tasks.length + 1, 
                          title: task.title,
                          description: task.description,
                          dueDate: task.dueDate,
                          status: task.status
                      };
                      tasks.push(newTask);
                  });

                  res.writeHead(201, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(tasks)); // Return the list of created tasks
              } else {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ message: 'Invalid request format. Expected an array of tasks.' }));
              }
          } catch (error) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'Invalid JSON format.' }));
          }
      });
  
   //archive
  }else if (path.startsWith('/tasks/') && method === 'PATCH' && path.endsWith('/archive')) {
    const id = parseInt(path.split('/')[2]);
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (task.completed) {
        if (!task.history) {
          task.history = []; 
        }
        task.history.push({
          timestamp: new Date(),
          changes: { status: 'archived' },
          changedBy: 'user123'
        });
        task.status = 'archived';
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(task));
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task must be completed to be archived' }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Task not found' }));
    }
  }
 //archived
  else if (path === '/tasks/archived' && method === 'GET') {
    handleAuthentication(() => {
      const archivedTasks = tasks.filter(task => task.status === 'archived');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(archivedTasks));
    });
  }
    //unassign
  else if (path.startsWith('/tasks/') && method === 'PATCH' && path.endsWith('/unassign')) {
    const id = parseInt(path.split('/')[2]);
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (!task.history) {
        task.history = []; 
      }
      task.history.push({
        timestamp: new Date(),
        changes: { assignedTo: null },
        changedBy: 'user123'
      });
      task.assignedTo = null;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(task));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Task not found' }));
    }
  } 
  //delete-all
  else if (path === '/tasks/delete-completed' && method === 'DELETE') {
    handleAuthentication(() => {
      const initialLength = tasks.length;
      tasks = tasks.filter(task => !task.completed); 
      const deletedCount = initialLength - tasks.length;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ count: deletedCount }));
    });

    
  }//delete
  else if (path.startsWith('/tasks/') && method === 'DELETE') {
    const id = parseInt(path.split('/')[2]);
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
      res.writeHead(204, { 'Content-Type': 'application/json' });
      res.end();
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Task not found' }));
    }
  } //catgorize
  else if (path.startsWith('/tasks/') && method === 'PATCH' && path.endsWith('/categorize')) {
    const id = parseInt(path.split('/')[2]);
   let body = '';
    req.on('data', chunk => {
     body += chunk.toString();
   });
    req.on('end', () => {
    const { category } = JSON.parse(body);
   const task = tasks.find(t => t.id === id);
    if (task) {
     if (!task.history) {
    task.history = []; 
    }
    task.history.push({
    timestamp: new Date(),
    changes: { category },
     changedBy: 'user123'
    });
    task.category = category;
    res.writeHead(200, { 'Content-Type': 'application/json' });
   res.end(JSON.stringify(task));
    } 
   else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Task not found' }));
    }
    });
     } //duplicate
     else if (path.startsWith('/tasks/') && method === 'POST' && path.endsWith('/duplicate')) {
      const id = parseInt(path.split('/')[2]);
      const task = tasks.find(t => t.id === id);
      if (task) {
     
     const newTask = { ...task, id: currentId++ };
    
     
     newTask.comments = [];
     newTask.history = [];
     tasks.push(newTask);
    
         
      
     res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newTask));
      } else {
      // Task with the given ID was not found
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Task not found' }));
      }
    }//share
    else if (path.startsWith('/tasks/') && method === 'POST' && path.endsWith('/share')) {
      const id = parseInt(path.split('/')[2]);
      const task = tasks.find(t => t.id === id);
    
      if (task) {
     
      const shareableLink = `http://localhost:5500/tasks/${id}/view-only`;
     
  
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ shareableLink }));
      } else {
     res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Task not found' })); }
    }
    //complete-all
    
    else if (path === '/tasks/complete-all' && method === 'PATCH') {
      let updatedTasks = [];
      tasks.forEach(task => {
      if (task.status === 'pending') {
       if (!task.history) {
       task.history = []; 
       }
      task.history.push({
      timestamp: new Date(),
      changes: { status: 'completed' }, changedBy: 'user123' });
      task.status = 'completed';
      updatedTasks.push(task);}
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updatedTasks));
      }
      
        //history
        else if (path.startsWith('/tasks/') && method === 'GET' && path.endsWith('/history')) {
          const id = parseInt(path.split('/')[2]);
          const task = tasks.find(t => t.id === id);
          if (task) {
            if (task.history && task.history.length > 0) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(task.history));
            } else {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'No history available for this task' }));
            }
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Task not found' }));
          }
        }
        
      
  
else if (path.startsWith('/tasks/') && method === 'PATCH' && path.endsWith('/complete')) {
  const id = parseInt(path.split('/')[2]);
  const task = tasks.find(t => t.id === id);
  if (task) {
   if (!task.history) {
   task.history = []; 
   }
   task.history.push({
   timestamp: new Date(),
   changes: { status: 'completed' },
   changedBy: 'user123'
   });
   task.status = 'completed';
    res.writeHead(200, { 'Content-Type': 'application/json' });
   res.end(JSON.stringify(task));
  } 
    
    }
  
  
  //commenting

  else if (path.startsWith('/tasks/') && method === 'POST' && path.endsWith('/comments')) {
    const id = parseInt(path.split('/')[2]);
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const { comment, commentedBy } = JSON.parse(body);
      const task = tasks.find((t) => t.id === id);
      if (task) {
        task.comments.push({ comment, commentedBy, timestamp: new Date() });
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(task));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Task not found' }));
      }
    });

  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Endpoint not found' }));
  }
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
