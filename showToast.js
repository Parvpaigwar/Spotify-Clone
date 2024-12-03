export const showToast = (operation,name) => {
    const toast = document.createElement("div");
    toast.classList.add("toast");
        


    if (operation === "add") {
        toast.textContent = ` ${name} has been added to favourite ❤ `;
    }
    else if (operation === "likedsongplaylist") {
        toast.textContent = `playing liked songs `;
    }
    else if (operation === "comingSoon") {
        toast.textContent = `This Feature is Coming Soon.... `;
    }
    else {
        toast.textContent = ` ${name} already in favourite ❤`;
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}