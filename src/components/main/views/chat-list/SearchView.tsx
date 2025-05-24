import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';

export default function SearchView({onSubmit, placeholder}:{onSubmit:(value:string)=>void, placeholder?:string}) {
    const [inputValue, setInputVale] = useState('');

    const handleSubmit = (e: React.FormEvent) =>{
        e.preventDefault();
        onSubmit(inputValue);
    };

    return(
        <form onSubmit={handleSubmit} className="flex flex-row h-full w-full border rounded">
            <input
              type="text"
              placeholder={placeholder || 'Search...'}
              value={inputValue}
              onChange={(e) => {setInputVale(e.target.value);}}
              className="w-full focus:outline-none border border-transparent"
            ></input>
            <button type="submit" className="button w-10">
                <FontAwesomeIcon icon={faSearch}/>
            </button>
        </form>
    );
}