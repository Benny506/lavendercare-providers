import { useSelector } from 'react-redux'
import './css/appLoading.css'
import { getAppLoadingSlice } from '@/redux/slices/appLoadingSlice'
import Image from '../ui/image'
import logo from '../../images/logo.svg'


export default function AppLoading({ tempLoading }){

    const appLoading = useSelector(state => getAppLoadingSlice(state).appLoading)

    if(appLoading || tempLoading){
        return(
            <div className="apploading-container">
                <img 
                    className='apploading-logo'
                    src={logo}
                    style={{ width: '70px', height: '70px' }} 
                />

                <div 
                    className='loader'
                />
            </div>
        )
    }
}