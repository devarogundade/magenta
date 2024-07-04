<template>
    <section>
        <div class="app_width">
            <footer>
                <p>Built by Traders for Traders.</p>

                <div class="links">
                    <a href="https://x.com/magentadex">Follow us on X</a>
                </div>
            </footer>
        </div>
    </section>
</template>

<style scoped>
section {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
}

footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    font-size: 16px;
    font-weight: 500;
    color: var(--tx-dimmed);
}

footer a {
    color: var(--primary);
}
</style>