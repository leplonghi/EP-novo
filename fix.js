import fs from 'fs';
['src/store/GameContext.tsx', 'src/screens/EquipeMobile.tsx', 'src/screens/ProfessorDashboard.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
    fs.writeFileSync(file, content);
  }
});
