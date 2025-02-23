<template>
    <q-carousel v-model="slide" :autoplay="3000" infinite :height="imageHeight" :width="imageWidth"
        class="bg-grey-8 q-ma-md carImg" navigation control-type="navigation-dots" swipeable
        navigation-dots-class="custom-dots">
        <q-carousel-slide :name="1" :img-src="img01" />
        <q-carousel-slide :name="2" :img-src="img02" />
        <q-carousel-slide :name="3" :img-src="img03" />
    </q-carousel>
</template>

<script>
import { ref } from 'vue';
import img01 from 'assets/banner/img01.jpeg';
import img02 from 'assets/banner/img02.jpeg';
import img03 from 'assets/banner/img03.jpeg';

export default {
    setup() {
        const slide = ref(1);
        const imageWidth = '100%';
        const imageHeight = '200px';

        return {
            slide,
            imageWidth,
            imageHeight,
            img01,
            img02,
            img03,
        };
    },
};
</script>