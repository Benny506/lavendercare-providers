import AppRoutes from './routes/Routes'
import './App.css'
import { ToastContainer } from 'react-toastify'
import AppLoading from './components/appLoading/AppLoading'

const App = () => {
  return (
    <>
      <AppLoading />
      
      <AppRoutes />

      <ToastContainer />
    </>
  )
}

export default App