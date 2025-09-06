import React from 'react';
import { useParams } from 'react-router-dom';
import Tasks from './Tasks';

const ProjectTasksRoute = () => {
  const { pid } = useParams();
  
  return <Tasks projectId={pid} />;
};

export default ProjectTasksRoute;
