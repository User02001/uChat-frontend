const ContactsSkeleton = () => {
 return (
  <div className="contacts-skeleton">
   {[...Array(5)].map((_, index) => (
    <div key={index} className="skeleton-contact-item">
     <div className="skeleton-contact-avatar"></div>
     <div className="skeleton-contact-info">
      <div className="skeleton-contact-name"></div>
      <div className="skeleton-contact-preview"></div>
     </div>
     <div className="skeleton-contact-time"></div>
    </div>
   ))}
  </div>
 );
};

export default ContactsSkeleton;