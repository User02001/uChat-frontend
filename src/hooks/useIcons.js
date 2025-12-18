import { useMemo } from 'react';

const icons = import.meta.glob('/public/resources/icons/*.svg', {
 query: '?raw',
 eager: true,
 import: 'default'
});

export const useIcon = (name) => {
 return useMemo(() => {
  const iconPath = `/public/resources/icons/${name}.svg`;
  return icons[iconPath] || null;
 }, [name]);
};