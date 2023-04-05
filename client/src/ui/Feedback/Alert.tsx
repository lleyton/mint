const AlertIcon = () => {
  return (
    <>
      <svg
        className="h-3.5 w-3.5 block group-hover:hidden fill-slate-500 dark:fill-slate-400 group-hover:fill-slate-700 dark:group-hover:fill-slate-200"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path d="M506.3 417l-213.3-364C284.8 39 270.4 32 256 32C241.6 32 227.2 39 218.1 53l-213.2 364C-10.59 444.9 9.851 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM52.58 432L255.1 84.8L459.4 432H52.58zM256 337.1c-17.36 0-31.44 14.08-31.44 31.44c0 17.36 14.11 31.44 31.48 31.44s31.4-14.08 31.4-31.44C287.4 351.2 273.4 337.1 256 337.1zM232 184v96C232 293.3 242.8 304 256 304s24-10.75 24-24v-96C280 170.8 269.3 160 256 160S232 170.8 232 184z" />
      </svg>
      <svg
        className="h-3.5 w-3.5 hidden group-hover:block fill-slate-500 dark:fill-slate-400 group-hover:fill-slate-700 dark:group-hover:fill-slate-200"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32z" />
      </svg>
    </>
  );
};

export default AlertIcon;
