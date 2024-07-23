document.getElementById('upload').addEventListener('click', async () => {
    const file = document.getElementById('file').files[0];
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        console.log('File uploaded successfully');
    } else {
        console.error('Error uploading file');
    }
});

document.getElementById('unsuspend').addEventListener('click', async () => {
    const mails = document.getElementById('mails').value;

    const response = await fetch('/unsuspend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mails })
    });

    if (response.ok) {
        console.log('Users unsuspended successfully');
    } else {
        console.error('Error unsuspending users');
    }
});
