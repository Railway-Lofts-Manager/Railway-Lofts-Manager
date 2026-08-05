import loftStore from "./LoftStore";

const lofts = loftStore.getLofts();

loftStore.subscribe((updatedLofts) => {
  lofts.splice(
    0,
    lofts.length,
    ...updatedLofts,
  );
});

export default lofts;