

export default function Button({text,width,color, onClick, disabled = false}){



    return (

        <button disabled={disabled} onClick={onClick} className={`text-lg hover:cursor-pointer ${width} font-serif libre-bold ${color}  text-black  rounded-full shadow-[2.5px_2.5px_0_#A57E5B] active:bg-[#A57E5B] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all`}>
  {text}
</button>


    );
}