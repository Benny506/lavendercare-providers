export default function ErrorMsg1({ className = "", errorMsg, position }){
    return(
        <p 
            style={{
                textAlign: position || 'left',
            }}
            className={`m-0 p-0 fw-600 txt-15 my-3 txt-EB1C25 ${className}`}
        >
            { errorMsg }
        </p>
    )
}