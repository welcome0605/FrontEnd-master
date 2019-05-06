import { ToastController } from 'ionic-angular';

export function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/-{2,}/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}
export function presentToast(toastCtrl: ToastController , message: string, duration:number =  5000 ){
    
    let toast = toastCtrl.create({
      message: message,
      duration: duration
    });
    return toast.present();
}