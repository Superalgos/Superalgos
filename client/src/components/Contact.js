import React from 'react'

const Contact = () => {
  return (
    <div>
    <section class="section container scrollspy" id="contact">
      <div class="row">
        <div class="col s12 l5">
          <h2 class="indigo-text text-darken-4">Get in Touch</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at lacus congue, suscipit elit nec, tincidunt orci.</p>
          <p>Mauris dolor augue, vulputate in pharetra ac, facilisis nec libero. Fusce condimentum gravida urna, vitae scelerisque erat ornare nec.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at lacus congue, suscipit elit nec, tincidunt orci.</p>
          <p>Mauris dolor augue, vulputate in pharetra ac, facilisis nec libero. Fusce condimentum gravida urna, vitae scelerisque erat ornare nec.</p>
        </div>
        <div class="col s12 l5 offset-l2">
          <form>
            <div class="input-field">
              <i class="material-icons prefix">email</i>
              <input type="email" id="email"/>
              <label for="email">Your Email</label>
            </div>
            <div class="input-field">
              <i class="material-icons prefix">message</i>
              <textarea id="message" class="materialize-textarea" cols="20" rows="20"></textarea>
              <label for="message">Your Message</label>
            </div>
            <div class="input-field">
              <i class="material-icons prefix">date_range</i>
              <input type="text" id="date" class="datepicker"/>
              <label for="date">Choose a date you need me for...</label>
            </div>
            <div class="input-field">
              <p>Services required:</p>
              <p>
                <label>
                  <input type="checkbox"/>
                  <span>Photography</span>
                </label>
              </p>
              <p>
                <label>
                  <input type="checkbox"/>
                  <span>Photo Editing</span>
                </label>
              </p>
            </div>
            <div class="input-field center">
              <button class="btn">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </section>
    </div>
  )
}

export default Contact
