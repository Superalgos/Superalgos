This is a draft of the boilerplate we'll use for backends using mongoose and node.

The following files are there as examples, you have to change them with your own :
  **/index.js files should be adapted for your file structure

  ./src/enums/EventState.js

  ./src/models/event.js
  ./src/models/plotter.js
  ./src/models/formula.js
    If you have relations between items, don't forget the "this.populate" statement (check ./src/models/events.js)

  ./src/schema/mutations/ChangeEventState.js => left there so you can see how to make mutation that take "normal arguments"
  ./src/schema/mutations/CreateEvent.js => left there so you can see how to make mutation that take "custom input types" as arguments
  ./src/schema/mutations/EditParticipant.js => left so you can see how to use axios to call another of our services if needed

  ./src/schema/queries/Events.js => minimal query
  ./src/schema/queries/EventsByHost.js => query with an argument

  ./src/schema/types/** => a few examples where left there so you can check them out, globally => first define your "return types" who should be very similar to your models. Then create you "input types" who should be used as much as possible if the input is a complexe object. It will help in the future when adding features as pageability, traits etc...
