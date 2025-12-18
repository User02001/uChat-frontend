import { useIcon } from '../hooks/useIcons';

const Icon = ({ name, className, style, alt, title, onClick, draggable = false, ...props }) => {
 const svgContent = useIcon(name);

 if (!svgContent) {
  console.warn(`Icon "${name}" not found`);
  return null;
 }

 return (
  <div
   className={className}
   style={style}
   title={title || alt}
   onClick={onClick}
   draggable={draggable}
   dangerouslySetInnerHTML={{ __html: svgContent }}
   {...props}
  />
 );
};

export default Icon;