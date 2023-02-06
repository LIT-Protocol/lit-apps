export const LitIcon = (props: any) => {
  const logos = [
    {
      name: "lit-logo",
      svg: (
        <svg
          width="1080"
          height="1080"
          viewBox="0 0 1080 1080"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M363.076 392.227C363.076 392.227 362.099 410.751 326.202 471.174C284.626 541.192 280.721 623.152 323.185 691.574C412.706 835.819 655.666 833.094 745.741 691.663C780.573 636.956 790.557 574.184 778.665 510.415C778.665 510.415 749.846 377.271 651.428 293.316C652.981 294.624 656.797 312.438 657.529 320.038C659.77 343.392 657.574 367.876 649.742 390.1C643.996 406.43 636.031 420.567 622.564 431.468C622.564 427.657 621.61 420.833 621.588 418.55C620.944 372.042 602.929 328.968 573.577 292.807C547.93 261.255 512.765 239.718 475.737 223.875C476.668 227.066 478.399 240.294 478.643 242.908C480.551 264.866 480.906 295.621 478.022 317.557C475.138 339.493 470.19 351.435 463.468 371.998C453.284 403.173 439.418 426.283 421.847 454.002C418.607 459.098 408.934 473.08 403.765 480.148C403.765 480.148 394.868 423.957 363.098 392.227H363.076Z"
            fill="white"
          />
          <path
            d="M562.5 27.2798L972.779 264.154C986.702 272.193 995.279 287.049 995.279 303.125V776.875C995.279 792.951 986.702 807.807 972.779 815.846L562.5 1052.72C548.577 1060.76 531.423 1060.76 517.5 1052.72L107.221 815.846C93.2982 807.807 84.7213 792.951 84.7213 776.875V303.125C84.7213 287.048 93.2982 272.193 107.221 264.154L517.5 27.2798C531.423 19.2413 548.577 19.2413 562.5 27.2798Z"
            stroke="white"
            strokeWidth="24.75"
          />
        </svg>
      ),
    },
    {
      name: "lit-logo-text",
      svg: (
        <svg
          width="62"
          height="46"
          viewBox="0 0 62 46"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M61.8399 20.7629V10.204H50.9056V5.68713L50.9467 0H40.3174V34.5451C40.3174 35.9335 40.5912 37.3082 41.1231 38.5906C41.655 39.873 42.4346 41.0379 43.4173 42.0187C44.3999 42.9994 45.5663 43.7768 46.8498 44.3062C48.1332 44.8356 49.5085 45.1067 50.8968 45.104L61.8399 45.0864V34.7006H53.6421C53.2792 34.701 52.9197 34.6298 52.5843 34.4911C52.2489 34.3523 51.9442 34.1488 51.6876 33.8922C51.4309 33.6356 51.2274 33.3308 51.0887 32.9955C50.95 32.6601 50.8788 32.3006 50.8792 31.9377V27.8315H50.9085C50.9085 25.485 50.9085 23.1386 50.9085 20.7541L61.8399 20.7629Z"
            fill="currentColor"
          ></path>
          <path
            d="M28.3854 10.204H36.6858V0H26.127V45.1246H36.6858V18.5713C36.6858 17.5327 36.2171 16.5496 35.4101 15.8958L28.3854 10.204Z"
            fill="currentColor"
          ></path>
          <path
            d="M10.5589 31.9377V0H0V34.5451C-2.62455e-06 35.9335 0.273789 37.3082 0.805706 38.5906C1.33762 39.873 2.11722 41.0379 3.09988 42.0187C4.08254 42.9994 5.24896 43.7768 6.5324 44.3062C7.81583 44.8356 9.19107 45.1067 10.5794 45.104L22.4728 45.0864V34.7006H13.3218C12.589 34.7006 11.8863 34.4095 11.3681 33.8914C10.85 33.3732 10.5589 32.6705 10.5589 31.9377Z"
            fill="currentColor"
          ></path>
        </svg>
      ),
    },
    {
      name: "shutdown",
      svg: (
        <svg
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-zjt8k"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path d="M13 3h-2v10h2V3zm4.83 2.17-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"></path>
        </svg>
      ),
    },
    {
      name: "open-new",
      svg: (
        <svg
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-zjt8k"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"></path>
        </svg>
      ),
    },
    {
      name: "copy",
      svg: (
        <svg
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-zjt8k"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
        </svg>
      ),
    },
    {
      name: "wallet",
      svg: (
        <svg
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-zjt8k"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path d="M18 4H6C3.79 4 2 5.79 2 8v8c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4V8c0-2.21-1.79-4-4-4zm-1.86 9.77c-.24.2-.57.28-.88.2L4.15 11.25C4.45 10.52 5.16 10 6 10h12c.67 0 1.26.34 1.63.84l-3.49 2.93zM6 6h12c1.1 0 2 .9 2 2v.55c-.59-.34-1.27-.55-2-.55H6c-.73 0-1.41.21-2 .55V8c0-1.1.9-2 2-2z"></path>
        </svg>
      ),
    },
    {
      name: "tick",
      svg: (
        <svg
          className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiSvgIcon-root MuiSvgIcon-fontSizeLarge css-zjt8k"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
        </svg>
      ),
    },
    {
      name: "greendot",
      svg: (
        <svg
          width="6"
          height="6"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="5" cy="5" r="5" fill="#00FF00" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {logos.map((logo, i) => {
        if (logo.name !== props.icon && i === logos.length) {
          return (
            <div key={i} className="">
              [Error] "{props.icon}"" not found
            </div>
          );
        }
        if (logo.name === props.icon) {
          return (
            <div key={i} {...props}>
              {logo.svg}
            </div>
          );
        }
      })}
    </>
  );
};
