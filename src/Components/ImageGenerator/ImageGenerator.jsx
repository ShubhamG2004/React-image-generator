import React,{useState} from 'react';
import './ImageGenerator.css';
import default_image from '../../assets/AI-image.png';

export const ImageGenerator = () => {
    const [imageUrl, setImageUrl] = useState("/");
    let inputRef = useRef(null);

  return (
    <div className="image-generator">
        <div className="header">Ai Image <span>Generator</span></div>
        <div className="img-loading">
            <div className="image"><img src={imageUrl === "/" ? default_image : imageUrl} alt="" /></div>
        </div>
        <div className="search-box">
            <input type="text" className='search-input' placeholder="Describe what you want to see?" />
            <div className="generate-btn">Generate</div>
        </div>
    </div>
  )
}
