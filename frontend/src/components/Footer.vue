<template>
  <footer class="footer-modern">
    <div class="footer-main-modern">
      <div class="footer-col-modern about">
        <img src="/Images/ehb-logo.png" alt="Erasmus Logo" class="footer-logo-modern" />
        <div class="footer-title-modern">OVER ONS</div>
        <div class="footer-underline-modern"></div>
        <div class="footer-text-modern">
          Erasmus Hogeschool Brussel is een bruisende plek waar studenten groeien, ontdekken en hun toekomst vormgeven. Samen werken we aan innovatie, kennis en kansen voor iedereen.
        </div>
      </div>
      <div class="footer-col-modern contact">
        <div class="footer-title-modern">CONTACT</div>
        <div class="footer-underline-modern"></div>
        <div class="footer-text-modern">
          Nijverheidskaai 170, 1070 Brussel<br />
          +32 2 523 37 37<br />
          <a href="mailto:info@ehb.be" class="footer-link-modern">info@ehb.be</a>
        </div>
      </div>
      <div class="footer-col-modern social">
        <div class="footer-title-modern">VOLG ONS</div>
        <div class="footer-underline-modern"></div>
        <div class="footer-social-row-modern">
          <a href="https://www.facebook.com/erasmushogeschool" target="_blank" class="footer-social-icon-modern" aria-label="Facebook">
            <img src="/Images/facebook-logo.png" alt="Facebook" />
          </a>
          <a href="https://www.instagram.com/erasmushogeschool" target="_blank" class="footer-social-icon-modern" aria-label="Instagram">
            <img src="/Images/instagram-logo.png" alt="Instagram" />
          </a>
          <a href="https://www.linkedin.com/school/erasmushogeschoolbrussel/" target="_blank" class="footer-social-icon-modern" aria-label="LinkedIn">
            <img src="/Images/linkedin-logo.png" alt="LinkedIn" />
          </a>
        </div>
      </div>
    </div>
    <div class="footer-bottom-modern">
      <div class="footer-bottom-line-modern"></div>
      <div class="footer-copyright-modern">
        &copy; {{ new Date().getFullYear() }} Erasmus Hogeschool Brussel. <span class="footer-author-modern"></span>
      </div>
    </div>
  </footer>
</template>
<script setup></script>
<style scoped>
.footer-modern {
  background: #fff7e6;
  color: #2d2d2d;
  padding: 0 0 0.5rem 0;
  font-family: 'Inter', Arial, sans-serif;
  margin-top: 3rem;
  box-shadow: 0 -2px 16px rgba(220,32,32,0.07);
  border-radius: 24px 24px 0 0;
  transition: box-shadow 0.2s;
}
.footer-main-modern {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 3.2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.7rem 2vw 1.2rem 2vw;
}
.footer-col-modern {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 200px;
  max-width: 340px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(255,179,71,0.07);
  padding: 2rem 1.5rem 1.2rem 1.5rem;
  margin-bottom: 1.2rem;
}
.footer-logo-modern {
  height: 54px;
  margin-bottom: 1.2rem;
  margin-top: 0.2rem;
  filter: drop-shadow(0 2px 8px #ffb34733);
}
.footer-title-modern {
  font-size: 1.18rem;
  font-weight: 900;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  margin-bottom: 0.18rem;
  color: #c20000;
}
.footer-underline-modern {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #ffb347 0%, #c20000 100%);
  margin-bottom: 1.1rem;
  border-radius: 2px;
}
.footer-text-modern {
  font-size: 1.08rem;
  color: #444;
  line-height: 1.7;
  margin-bottom: 0.2rem;
}
.footer-link-modern {
  color: #c20000;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s;
}
.footer-link-modern:hover {
  color: #ffb347;
  text-decoration: underline;
}
.footer-social-row-modern {
  display: flex;
  gap: 1.1rem;
  margin-top: 0.2rem;
}
.footer-social-icon-modern {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #fff7e6;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(255,179,71,0.13);
  transition: box-shadow 0.2s, transform 0.2s;
  border: 2px solid #ffb347;
}
.footer-social-icon-modern img {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: none;
  transition: filter 0.2s;
}
.footer-social-icon-modern:hover {
  box-shadow: 0 4px 16px #ffb347;
  transform: translateY(-2px) scale(1.09);
  background: #fff3d1;
}
.footer-social-icon-modern:hover img {
  filter: brightness(1.1) drop-shadow(0 2px 6px #ffb347);
}
.footer-bottom-modern {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.7rem 2vw 0 2vw;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  position: relative;
}
.footer-bottom-line-modern {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, #ffb347 0%, #c20000 100%);
  border-radius: 1px;
  opacity: 0.7;
}
.footer-copyright-modern {
  color: #c20000;
  font-size: 1.08rem;
  font-weight: 500;
  letter-spacing: 0.2px;
  z-index: 1;
}
.footer-author-modern {
  color: #ffb347;
  font-weight: 700;
}
@media (max-width: 900px) {
  .footer-main-modern {
    flex-direction: column;
    align-items: center;
    gap: 2.2rem;
    padding: 1.5rem 2vw 0.7rem 2vw;
  }
  .footer-col-modern {
    min-width: unset;
    max-width: 100%;
    align-items: center;
    text-align: center;
    padding: 1.5rem 1rem 1rem 1rem;
  }
  .footer-logo-modern {
    margin-left: auto;
    margin-right: auto;
  }
  .footer-bottom-modern {
    justify-content: center;
    padding: 0.7rem 2vw 0 2vw;
  }
}
</style> 