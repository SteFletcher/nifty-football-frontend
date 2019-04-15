<template>
    <div>
        <network-web3-banner></network-web3-banner>
        <div class="container">
            <div class="row pb-4">
                <div class="col">

                </div>
                <div class="col">
                    <img src="../assets/logo.svg" style="max-height: 75px" class="mt-3 mb-3"/>
                </div>
                <div class="col">
                    <h2 class="mt-3 text-right">{{ $t('nav.rankings') }}</h2>
                </div>
            </div>

            <div class="row pb-4 text-center" v-if="rankings && rankings.length === 0">
                <div class="col mb-5 text-primary">
                    <loading></loading>
                </div>
            </div>

            <div class="row" v-if="rankings && rankings.length > 0">
                <div class="col-3 mb-5" v-for="(rank, index) in rankings" v-bind:key="rank.tokenId">
                    <h3 class="text-left">#{{ index + 1 }}</h3>
                    <lazy-img-loader :src="rank.tokenId" :id="rank.tokenId"></lazy-img-loader>
                </div>
            </div>

            <div class="row" v-if="rankings && rankings.length > 0">
                <div class="col text-right">
                    <p class="small">Rankings updated every 10 mins</p>
                </div>
            </div>


            <!--<div v-if="squad && order === 'team'">-->
            <!--<div class="row mb-5" v-for="(team, index) in teamArray" v-bind:key="team[0]">-->
            <!--<div class="col-4 text-right">-->
            <!--<h1>{{ index + 1 }}</h1>-->
            <!--</div>-->
            <!--<div class="col-4 text-right">-->
            <!--<h4>{{ team[0] }}</h4>-->
            <!--</div>-->
            <!--<div class="col-4 text-left">-->
            <!--<span class="numberCircle">{{ team[1] }}</span>-->
            <!--</div>-->
            <!--</div>-->
            <!--</div>-->

        </div>
    </div>
</template>
<script>
    import Vue2Filters from 'vue2-filters';
    import { mapState } from 'vuex';
    import LazyImgLoader from '../components/LazyImgLoader';
    import NetworkWeb3Banner from '../components/NetworkWeb3Banner';
    import Loading from '../components/Loading';

    export default {
        components: {Loading, NetworkWeb3Banner, LazyImgLoader},
        mixins: [Vue2Filters.mixin],
        data () {
            return {
                order: 'attributeAvg',
                teamArray: [['Ell\'s Angels', 93], ['Real Madras', 91], ['Athletico Berlin', 86], ['Super Reds', 86], ['Yellow Submarine', 84]],
                rankings: [],
            };
        },
        computed: {
            ...mapState([
                'cardsApiService'
            ]),
        },
        methods: {
            setOrder: function (field) {
                return this.order ? this.order = field : this.order;
            },
        },
        async created () {
            const loadRankings = async () => {
                this.cardsApiService.loadRankings().then((rankings) => {
                    this.rankings = rankings;
                });
            };

            this.$store.watch(
                () => this.cardsApiService.network,
                () => loadRankings()
            );

            if (this.cardsApiService.network) {
                loadRankings();
            }
        },
    };
</script>

<style lang="scss">
    @import "../colours";

    .numberCircle {
        font-size: 1.3rem;
        border-radius: 50%;

        width: 45px;
        height: 45px;
        padding: 10px;

        background: $tertiary;
        border: 2px solid $primary;
        color: $secondary;
        text-align: center;
    }
</style>