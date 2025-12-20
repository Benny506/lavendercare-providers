export default function Image({ src, alt, className, onClick }){

    const handleImgClick = (e) => onClick && onClick(e)

    return(
        <img 
            src={`${src}`}
            alt={alt}
            className={className}
            onClick={handleImgClick}
        />
    )
}