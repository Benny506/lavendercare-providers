import Modal from "./Modal"

export default function ConfirmModal({ modalProps, children }) {

    if (!modalProps) return <></>

    const { visible, hide, data } = modalProps

    const handleYes = () => {
        if (data?.yesFunc) {
            data?.yesFunc(data)
        }

        return hide && hide()
    }

    const handleCancel = () => {
        if (data?.noFunc) {
            data?.noFunc(data)
        }

        return hide && hide()
    }

    return (
        visible
        &&
        <Modal
            isOpen={visible}
            onClose={hide}
            title={data?.title || 'Delete'}
            description={data?.msg || "Are you sure? This action cannot be undone"}
            primaryButton="Yes"
            primaryButtonFunc={handleYes}
            secondaryButton="Cancel"
            secondaryButtonFunc={handleCancel}
            styles={{
                // wrapper: 'd-flex items-center justify-center'
            }}
        />
    )
}