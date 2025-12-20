import {useNavigate} from 'react-router-dom';
import Image from './ui/image';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full">
      <div className="w-full h-22 pt-5 pb-6 p-25">
        <div className="flex items-center md:items-start justify-center md:justify-start">
          <Image className="h-full cursor-pointer" src='assets/lavendercare-logo.svg' onClick={() => navigate("/")} />
        </div>
      </div>
    </div>
  )
}

export default Navbar