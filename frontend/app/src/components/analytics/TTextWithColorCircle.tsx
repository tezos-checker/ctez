import React from 'react';


export interface TextColor  {
  color:string,
  text:string,
}

const TextWithCircleColor: React.FC<TextColor> = (props) => {
  return (
     <span className='textContainer'>
       <span style={{backgroundColor:props.color}} className='circleIcon' />
       <span>{props.text}</span>
     </span>
    )
};

export { TextWithCircleColor };
