import { useIcon } from '../hooks/useIcons';

const Icon = ({ name, className, style, alt, title, onClick, draggable = false, ...props }) => {
 const iconData = useIcon(name);

 if (!iconData) {
  console.warn(`Icon "${name}" not found`);
  return null;
 }

 // SVG: Inline it
 if (iconData.type === 'svg') {
  return (
   <div
    className={className}
    style={style}
    title={title || alt}
    onClick={onClick}
    draggable={draggable}
    dangerouslySetInnerHTML={{ __html: iconData.content }}
    {...props}
   />
  );
 }

 // PNG: Use img tag with hashed URL
 if (iconData.type === 'png') {
  return (
   <img
    src={iconData.content}
    alt={alt}
    title={title || alt}
    className={className}
    style={style}
    onClick={onClick}
    draggable={draggable}
    {...props}
   />
  );
 }

 return null;
};

export default Icon;