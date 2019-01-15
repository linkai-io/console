export class Addresses {
  addressGroups = [];
  addresses = [];
  addGroup(group) {
    for (let i = 0; i < addressGroups.length; i++) {
      if ((addressGroups[i].group_id = group.group_id)) {
        addressGroups[i] = group; // update the group
        return;
      }
    }
    // group did not already exist, add it.
    this.addressGroups.push(group);
  }
  removeGroup(group) {
    for (let i = 0; i < addressGroups.length; i++) {
      if ((addressGroups[i].group_id = group.group_id)) {
        addressGroups.splice(i);
        return;
      }
    }
  }
}
