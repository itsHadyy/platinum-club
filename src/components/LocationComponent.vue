<template>
    <div class="q-pa-md">
        <p class="text-h6">Our Location</p>

        <div class="location">
            <p>New Cairo, Cairo Governorate 11841!</p>
            <q-btn color="secondary" label="Get Directions" @click="openMaps" />
        </div>
    </div>
</template>

<script setup>


const openMaps = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    let mapsUrl = isIOS
        ? `https://maps.apple.com/?address=Cairo%0A11865%0AEgypt&auid=726243192175014205&ll=30.038393,31.528181&lsp=9902&q=Platinum%20Club&t=m`
        : `https://www.google.com/maps/place/Platinum+Equestrian+Club/@29.9947207,31.5043718,12.26z/data=!4m6!3m5!1s0x145822064f916e47:0xc153abf8087b0ae8!8m2!3d30.0386398!4d31.5290786!16s%2Fg%2F1jkw2zfy6?entry=ttu&g_ep=EgoyMDI1MDMwNC4wIKXMDSoASAFQAw%3D%3D`;

    window.open(mapsUrl, "_blank");
};
</script>

<style scoped>
.text-center {
    text-align: center;
}
</style>