let html;
export default html = `

<footer class="footer-top__wrapper" role="contentinfo">
  <div class="footer-top__inner l--offset-wide l--wrapper">
  <div class="footer-top__logo-social">
    <div class="footer-top__logo">
      <img src="https://www.neonscience.org/themes/custom/neon/images/neon-white-logo.svg" alt="NEON Logo" />
    </div>
    <div class="footer-top__social">
      <h4>Follow Us:</h4>
      <ul>
        <li class="facebook"><a href="https://www.facebook.com/NEONScienceData" target="_blank" rel="noopener noreferrer" aria-label="Facebook link"><svg viewBox="0 0 12 24" width="12" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M3 24V13H0V9h3V5.5C3 2.667 4.778 0 9 0c1.694 0 3 .222 3 .222L11.833 4H9.25C7.722 4 7.5 4.833 7.5 6v3H12l-.306 4H7.5v11H3z" fill="inherit" fill-rule="nonzero"/></svg></a></li>
        <li class="twitter"><a href="https://twitter.com/NEON_Sci" target="_blank" rel="noopener noreferrer" aria-label="Twitter link"><svg viewBox="0 0 24 20" width="24" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M24 2.306c-.667 1-1.5 1.86-2.444 2.555V5.5c0 6.5-4.945 14-14 14-2.778 0-5.39-.611-7.556-2a8.24 8.24 0 0 0 1.167.083c2.305 0 4.444-1 6.11-2.333-2.138-.028-3.971-1.472-4.583-3.417a5.115 5.115 0 0 0 2.223-.083A4.921 4.921 0 0 1 .972 6.917V6.86a5.009 5.009 0 0 0 2.222.611A4.895 4.895 0 0 1 1 3.39c0-.917.25-1.667.667-2.389C4.11 3.972 7.722 5.833 11.806 6.056a5.112 5.112 0 0 1-.112-1.14A4.908 4.908 0 0 1 16.611 0c1.417 0 2.695.611 3.611 1.556A10.05 10.05 0 0 0 23.333.36a4.905 4.905 0 0 1-2.166 2.722c1-.11 1.944-.389 2.833-.777z" fill="inherit" fill-rule="evenodd"/></svg></a></li>
        <li class="linkedin"><a href="https://www.linkedin.com/company/neon-science" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn link"><svg viewBox="0 0 24 24"  width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M.5 8.5h5V24h-5V8.5zm13 6.5v9h-5V12s-.083-2.972-.083-3.5h4.916l.167 2.139C14.5 9.139 16 8 18 8c3.5 0 6 2.5 6 7v9h-5v-8.5c0-2.5-1.222-3.5-2.722-3.5S13.5 13 13.5 15zM2.972 6h-.028C1.167 6 0 4.778 0 3.25 0 1.694 1.194.5 3.028.5 4.833.5 5.972 1.694 6 3.25 6 4.778 4.833 6 2.972 6z" fill="inherit" fill-rule="nonzero"/></svg></a></li>
        <li class="youtube"><a href="http://www.youtube.com/neonscience" target="_blank" rel="noopener noreferrer" aria-label="YouTube link"><svg viewBox="0 0 24 18"  width="24" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5c12 0 12 0 12 8.5s0 8.5-12 8.5S0 17.5 0 9 0 .5 12 .5zm-3 13L16.5 9 9 4.5v9z" fill="inherit" fill-rule="evenodd"/></svg></a></li>
        <li class="instgram"><a href="https://www.instagram.com/neon.sci/" target="_blank" rel="noopener noreferrer" aria-label="Instagram link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="18"><path d="M17.34,5.46h0a1.2,1.2,0,1,0,1.2,1.2A1.2,1.2,0,0,0,17.34,5.46Zm4.6,2.42a7.59,7.59,0,0,0-.46-2.43,4.94,4.94,0,0,0-1.16-1.77,4.7,4.7,0,0,0-1.77-1.15,7.3,7.3,0,0,0-2.43-.47C15.06,2,14.72,2,12,2s-3.06,0-4.12.06a7.3,7.3,0,0,0-2.43.47A4.78,4.78,0,0,0,3.68,3.68,4.7,4.7,0,0,0,2.53,5.45a7.3,7.3,0,0,0-.47,2.43C2,8.94,2,9.28,2,12s0,3.06.06,4.12a7.3,7.3,0,0,0,.47,2.43,4.7,4.7,0,0,0,1.15,1.77,4.78,4.78,0,0,0,1.77,1.15,7.3,7.3,0,0,0,2.43.47C8.94,22,9.28,22,12,22s3.06,0,4.12-.06a7.3,7.3,0,0,0,2.43-.47,4.7,4.7,0,0,0,1.77-1.15,4.85,4.85,0,0,0,1.16-1.77,7.59,7.59,0,0,0,.46-2.43c0-1.06.06-1.4.06-4.12S22,8.94,21.94,7.88ZM20.14,16a5.61,5.61,0,0,1-.34,1.86,3.06,3.06,0,0,1-.75,1.15,3.19,3.19,0,0,1-1.15.75,5.61,5.61,0,0,1-1.86.34c-1,.05-1.37.06-4,.06s-3,0-4-.06A5.73,5.73,0,0,1,6.1,19.8,3.27,3.27,0,0,1,5,19.05a3,3,0,0,1-.74-1.15A5.54,5.54,0,0,1,3.86,16c0-1-.06-1.37-.06-4s0-3,.06-4A5.54,5.54,0,0,1,4.21,6.1,3,3,0,0,1,5,5,3.14,3.14,0,0,1,6.1,4.2,5.73,5.73,0,0,1,8,3.86c1,0,1.37-.06,4-.06s3,0,4,.06a5.61,5.61,0,0,1,1.86.34A3.06,3.06,0,0,1,19.05,5,3.06,3.06,0,0,1,19.8,6.1,5.61,5.61,0,0,1,20.14,8c.05,1,.06,1.37.06,4S20.19,15,20.14,16ZM12,6.87A5.13,5.13,0,1,0,17.14,12,5.12,5.12,0,0,0,12,6.87Zm0,8.46A3.33,3.33,0,1,1,15.33,12,3.33,3.33,0,0,1,12,15.33Z"/></svg></a></li>
      </ul>
    </div>

    </div>


    <div class="footer-top__newsletter">
      <div class="footer-top__newsletter-text">
        <h4>Join Our Newsletter</h4>
        <p>Get updates on events, opportunities, and how NEON is being used today.</p>
      </div>
      <div class="footer-top__newsletter-btn">
        <a href="https://www.neonscience.org/neon-newsletter-sign">Subscribe Now
        <svg width="13px" height="10px" viewBox="0 0 13 10" xmlns="http://www.w3.org/2000/svg"><g class="chevronGroup" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round" stroke="#FFFFFF" stroke-width="2" transform="translate(1.000000, 1.000000)"><path d="M11,4 L7,8" class="bottom"></path><path d="M11,4 L7,0" class="top"></path><path d="M11,4 L0,4" class="line"></path></g></svg>
                </a>
      </div>
    </div>


      </div>
</footer>


<footer class="footer-bottom__wrapper" role="contentinfo">
  <div class="footer-bottom__inner l--offset-wide l--wrapper">
    <div class="footer-bottom__menu">
        <div>
    <nav role="navigation" aria-labelledby="block-footer-menu" id="block-footer">
            
  <h2 class="visually-hidden" id="block-footer-menu">Footer</h2>
  

        
          <ul  class="menu menu--footer" data-depth="0">
          <li  class="myAccount menu__item">
        <a href="https://www.neonscience.org/user/login" title="My Account" class="menu__link" data-plugin-id="menu_link_content:37baf8ce-2914-43bf-9297-08588eb3d56f" data-drupal-link-system-path="user/login">My Account</a>
              </li>
          <li  class="menu__item">
        <a href="https://www.neonscience.org/about" title="About Us" class="menu__link" data-plugin-id="menu_link_content:06cc4ae6-95bb-4346-a0e9-6f27f3c48368" data-drupal-link-system-path="node/8793">About Us</a>
              </li>
          <li  class="menu__item">
        <a href="https://www.neonscience.org/impact/newsroom" class="menu__link" data-plugin-id="menu_link_content:214a668b-1f79-4871-a8d1-c0c86269b559" data-drupal-link-system-path="node/10890">Newsroom</a>
              </li>
          <li  class="menu__item">
        <a href="https://www.neonscience.org/about/contact-us" title="Contact Us" class="menu__link" data-plugin-id="menu_link_content:dd9d8fc1-0e31-4927-a1cc-33171a5e6843" data-drupal-link-system-path="node/24">Contact Us</a>
              </li>
          <li  class="menu__item">
        <a href="https://www.neonscience.org/terms-use" title="Terms &amp; Conditions" class="menu__link" data-plugin-id="menu_link_content:07159864-5327-46a9-a026-e60fa4cbfa05" data-drupal-link-system-path="node/31">Terms &amp; Conditions</a>
              </li>
          <li  class="menu__item">
        <a href="https://www.neonscience.org/get-involved/work-opportunities/careers" class="menu__link" data-plugin-id="menu_link_content:cbe8afdf-f98d-429d-aa0a-842196d4654e">Careers</a>
              </li>
          <li  class="menu__item">
        <a href="https://www.neonscience.org/neon-code-conduct" class="menu__link" data-plugin-id="menu_link_content:4557061a-f1f3-4fc9-a14d-d3a9517d4cfb" data-drupal-link-system-path="node/12759">Code of Conduct</a>
              </li>
        </ul>
  


  </nav>

  </div>

    </div>
    <div class="footer-bottom__copyright">
      <p>Copyright &copy; Battelle, 2023</p>
    </div>
    <div class="footer-bottom__message">
      <p>The National Ecological Observatory Network is a major facility fully funded by the National Science Foundation.</p><p>Any opinions, findings and conclusions or recommendations expressed in this material do not necessarily reflect the views of the National Science Foundation.</p>
    </div>
  </div>
</footer>

`;