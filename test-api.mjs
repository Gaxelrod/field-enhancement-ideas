const API_KEY = 'v1.public.eyJqdGkiOiIwMTJmYTVjYS1hODhiLTRhOTItODA1MS0wMWQwMTYyNTFlNDEifVOrwoHvEtTxFbxVK0Z0LiZIc8Ia7CPoFV96vWJyQXJx89XngYVi2XLU5AHvp4l-ftjRPsi_qsoUs18vqMMP1T45VdVwJ6DyMF0voEEgp13-VNF257Mzu0pO0STr5U14n3izkllT3a_qqhpyzbEnW6Vf_PRRi8VAbTntvoA6prxjLEVC6-37KNT1TxMD0cKGrHIxm4iLCZbIZRCPB_aOAA_K40_yREyyLOloOjUGA3VZY-BlplOzqvT07iconjDMWg22GwvikCh-2vgLqX-FtKpFnIGshU_lqGCnSzcNkZFWHCrcfPf9gcB9zmu96gSwETDTvZJDYuyZfdLC4XXHTAM.MGFjMDA4ZmUtYWRiYy00NTgyLTg0Y2MtZTY3MzFlZDRmYTQ1';

const res = await fetch(
  `https://places.geo.us-east-1.amazonaws.com/v2/autocomplete?key=${API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ QueryText: '123 Main St', MaxResults: 5 }),
  }
);
console.log('Status:', res.status);
const data = await res.text();
console.log('Response:', data);
