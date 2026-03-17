const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'app', 'components');
const routesPath = path.join(__dirname, 'src', 'app', 'routes.tsx');

const adminDir = path.join(componentsDir, 'admin');
const organizerDir = path.join(componentsDir, 'organizer');
const volunteerDir = path.join(componentsDir, 'volunteer');
const sharedDir = path.join(componentsDir, 'shared');

[adminDir, organizerDir, volunteerDir, sharedDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') && fs.statSync(path.join(componentsDir, f)).isFile());

files.forEach(file => {
  let targetDir;
  if (file.startsWith('Admin')) targetDir = adminDir;
  else if (file.startsWith('Organizer') || file === 'CreateEvent.tsx') targetDir = organizerDir;
  else if (file.startsWith('Volunteer')) targetDir = volunteerDir;
  else targetDir = sharedDir;

  const oldPath = path.join(componentsDir, file);
  const newPath = path.join(targetDir, file);
  
  let content = fs.readFileSync(oldPath, 'utf8');
  // replace AuthContext import
  content = content.replace(/from ['"]\.\.\/contexts/g, 'from "../../contexts');
  // replace ui imports
  content = content.replace(/from ['"]\.\/ui\//g, 'from "../ui/');
  
  fs.writeFileSync(newPath, content);
  fs.unlinkSync(oldPath);
});

// Update routes.tsx
let routesContent = fs.readFileSync(routesPath, 'utf8');
routesContent = routesContent.replace(/\.\/components\/Admin([A-Za-z0-9]+)/g, './components/admin/Admin$1');
routesContent = routesContent.replace(/\.\/components\/(Organizer[A-Za-z0-9]+|CreateEvent)/g, './components/organizer/$1');
routesContent = routesContent.replace(/\.\/components\/Volunteer([A-Za-z0-9]+)/g, './components/volunteer/Volunteer$1');
routesContent = routesContent.replace(/\.\/components\/(BottomNav|EventDetails|Header|LandingPage|Layout|ProtectedRoute)/g, './components/shared/$1');

fs.writeFileSync(routesPath, routesContent);
console.log("Restructuring complete!");
