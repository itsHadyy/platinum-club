<template>
    <q-dialog v-model="dialog">
        <q-card style="width: 100%; max-width: 90vw;" class="q-pa-md">
            <!-- <q-card-actions align="left">
                <q-btn flat label="Close" color="primary" v-close-popup />
            </q-card-actions> -->

            <q-card-section class="row items-center justify-between">
                <div class="text-h6">Contact us</div>
                <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section>
                <div class="contact-info">
                    <div class="info-item">
                        <q-icon name="email" color="primary" />
                        <span>{{ email }}</span>
                    </div>
                    <div class="info-item">
                        <q-icon name="phone" color="primary" />
                        <span>{{ phone }}</span>
                    </div>
                    <div class="info-item">
                        <q-icon name="public" color="primary" />
                        <span>{{ website }}</span>
                    </div>
                    <div class="info-item">
                        <q-icon name="place" color="primary" />
                        <span>{{ address }}</span>
                    </div>
                </div>
            </q-card-section>

            <q-separator />

            <q-card-section>
                <div class="text-h6">Send an email:</div>
                <div class="contact-form">
                    <q-input v-model="name" label="Name" />
                    <q-input v-model="formEmail" label="Email" />
                    <q-select v-model="subject" :options="subjectOptions" label="Subject" />
                    <q-input v-model="message" label="Message" type="textarea" />
                    <q-btn color="primary" label="Submit" @click="submitForm" class="q-mt-md bg-secondary"
                        style="min-width: 50%; width: 50%; margin: auto;" />
                </div>
            </q-card-section>

        </q-card>
    </q-dialog>
</template>

<script>
import { ref } from 'vue';

export default {
    setup() {
        const dialog = ref(false);
        const email = 'info@platinumClub.com';
        const phone = '+20 123 456 7890';
        const website = 'www.platinumClub.com';
        const address = 'New Cairo, Cairo, Egypt';

        const name = ref('');
        const formEmail = ref('');
        const message = ref('');

        const subject = ref(null);
        const subjectOptions = [
            'Sports',
            'Food & Beverage',
            'Membership',
            'Facilities & Services',
            'Fees & Payment',
            'Cleaniness & Hygiene',
            'Security',
            'Feedback',
            'Recommendations',
            'Lost & Found',
            'Other'
        ];

        const submitForm = async () => {
            try {
                const response = await fetch("http://localhost:3000/send-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name.value,
                        email: formEmail.value,
                        subject: subject.value,
                        message: message.value,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    alert("Email sent successfully!");
                } else {
                    alert("Failed to send email.");
                }
            } catch (error) {
                console.error("Error sending email:", error);
                alert("An error occurred.");
            }

            name.value = '';
            formEmail.value = '';
            message.value = '';
            dialog.value = false;
        };

        return {
            dialog,
            email,
            phone,
            website,
            address,
            name,
            formEmail,
            message,
            subject,
            subjectOptions,
            submitForm,
        };
    },
};
</script>

<style scoped>
.contact-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>