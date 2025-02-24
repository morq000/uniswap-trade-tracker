import { processTrade } from "../src/tradeProcessor";
import { sendTelegramMessage } from "../src/telegram_notifier";
import { executeTrade } from "../src/universal_router";
import { processTransactionStats } from "../src/statsEngine";

// Мокаем зависимости
jest.mock("../src/telegram_notifier", () => ({
    sendTelegramMessage: jest.fn(),
}));

jest.mock("../src/universal_router", () => ({
    executeTrade: jest.fn(),
}));

// jest.mock("../src/statsEngine", () => ({
//     processTransactionStats: jest.fn(),
// }));

describe("ProcessTrade", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    const v3Swaps = [
        {
          "amount0": "-2353087760.072729172885962475",
          "amount1": "0.497512437810945273",
          "amountUSD": "1193.524687560943114679198782809897",
          "id": "0x03dca0db3ab84344fc4bdc549842e14321e34040b66b7dee4f98061f93dd0bb2#4093",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "sender": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "timestamp": "1730764415",
          "token0": {
            "decimals": "18",
            "id": "0x556c3cbdca77a7f21afe15b17e644e0e98e64df4",
            "symbol": "MAO"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "2353087760.072729172885962475",
          "amount1": "-0.584944371250470908",
          "amountUSD": "1404.953915612677476013056644155724",
          "id": "0x02b03b205e6b65baa07c3a37f1a49cde387e9b30c19e606bf211d389214a0532#4140",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "sender": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "timestamp": "1730768435",
          "token0": {
            "decimals": "18",
            "id": "0x556c3cbdca77a7f21afe15b17e644e0e98e64df4",
            "symbol": "MAO"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "-1784861608.350034461402271781",
          "amount1": "0.497512437810945273",
          "amountUSD": "1206.396424660116544610131629846544",
          "id": "0xc50c01852d66f525bdfe2ff095e975ae595dcadca507c2b794e2066834a68e16#4406",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "sender": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "timestamp": "1730785379",
          "token0": {
            "decimals": "18",
            "id": "0x556c3cbdca77a7f21afe15b17e644e0e98e64df4",
            "symbol": "MAO"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "1784861608.350034461402271781",
          "amount1": "-0.547791606080719677",
          "amountUSD": "1334.087245827311780589253440203118",
          "id": "0xf7f046762bfbe0aa66ee5f4f6c3da4c92404a482621212846c1e0aa961212839#4741",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "sender": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "timestamp": "1730820971",
          "token0": {
            "decimals": "18",
            "id": "0x556c3cbdca77a7f21afe15b17e644e0e98e64df4",
            "symbol": "MAO"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "-42185.679839536784997509",
          "amount1": "1.194029850746268656",
          "amountUSD": "2884.151096565773730050530273779481",
          "id": "0xaaaf7c30434a5c600e026958d36e8e001af3086aaae5d07804260c20a3974e7a#20728",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "sender": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "timestamp": "1730845691",
          "token0": {
            "decimals": "18",
            "id": "0x9343e24716659a3551eb10aff9472a2dcad5db2d",
            "symbol": "STFX"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "42185.679839536784997509",
          "amount1": "-1.210926681333407343",
          "amountUSD": "2942.690712385475145814857551077239",
          "id": "0x58da0f54b19967c3fe90e42b8ac8520dbdd3ab59e3c05b1201ec171514c4680a#20776",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "sender": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "timestamp": "1730848091",
          "token0": {
            "decimals": "18",
            "id": "0x9343e24716659a3551eb10aff9472a2dcad5db2d",
            "symbol": "STFX"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "-35132.907926990896685619",
          "amount1": "1",
          "amountUSD": "2427.850022297319364002757693441558",
          "id": "0x1092a02444505aa1d79faa9fa83a886a4528897a44b0206501a6814a5aca75b5#20809",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "sender": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "timestamp": "1730851991",
          "token0": {
            "decimals": "18",
            "id": "0x9343e24716659a3551eb10aff9472a2dcad5db2d",
            "symbol": "STFX"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "35045.075657173419443905",
          "amount1": "-0.948599774656358618",
          "amountUSD": "2354.348903967204767236047914869226",
          "id": "0xd8d48ee89abd0d30fcd1fcc19db621107ce82dc224448ec714bb7041bc22280b#20839",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "sender": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "timestamp": "1730856467",
          "token0": {
            "decimals": "18",
            "id": "0x9343e24716659a3551eb10aff9472a2dcad5db2d",
            "symbol": "STFX"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "-1034780361.697008561937833938",
          "amount1": "0.5",
          "amountUSD": "1295.266452171679835010597792372477",
          "id": "0xe2788df2bb699bfd71fab311e34993a3196a5e7b8500dc82f14c059ba224daf0#5668",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "sender": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "timestamp": "1730869247",
          "token0": {
            "decimals": "18",
            "id": "0x556c3cbdca77a7f21afe15b17e644e0e98e64df4",
            "symbol": "MAO"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "1032193410.792766040532989354",
          "amount1": "-0.569510049685658114",
          "amountUSD": "1477.403577041470974450317988375081",
          "id": "0xa135bf1339ed5d8b1d45a3ac7091b1919f5828a65a04cbdb7337825c48ed09dc#5762",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "sender": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "timestamp": "1730877707",
          "token0": {
            "decimals": "18",
            "id": "0x556c3cbdca77a7f21afe15b17e644e0e98e64df4",
            "symbol": "MAO"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "-41825.019855330818759013",
          "amount1": "1",
          "amountUSD": "2587.309994000006832136140837007598",
          "id": "0x21d7e993592df265d8e4b29e32eb4bb060b04a0e7c39bf3c304a4568005f0129#30274",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "sender": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "timestamp": "1730882687",
          "token0": {
            "decimals": "18",
            "id": "0x1121acc14c63f3c872bfca497d10926a6098aac5",
            "symbol": "DOGE"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "-176695.856265715362941466",
          "amount1": "1.2",
          "amountUSD": "3162.32336817547496009924974622806",
          "id": "0xad41277e08e608e8a380d52ce69afe922c68d8ddc12f11a87d8567776507cb47#15261",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "sender": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "timestamp": "1730904347",
          "token0": {
            "decimals": "18",
            "id": "0x525574c899a7c877a11865339e57376092168258",
            "symbol": "GURU"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "176254.116625051074534113",
          "amount1": "-1.236153245379693002",
          "amountUSD": "3282.218601785523072291670829582151",
          "id": "0x9693b48ed1e22e642e4a7eb73419512584bde2ced645701afb17a64b70a442e8#15291",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "sender": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "timestamp": "1730911283",
          "token0": {
            "decimals": "18",
            "id": "0x525574c899a7c877a11865339e57376092168258",
            "symbol": "GURU"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "-1004640281.14629559726995377",
          "amount1": "0.497512437810945273",
          "amountUSD": "1419.089741185837412942851485000097",
          "id": "0x523270be68178ff3d494d765ade27211ec13b973dd8bb3c0be81b232a91cf2ca#7254",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "sender": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "timestamp": "1730948015",
          "token0": {
            "decimals": "18",
            "id": "0x556c3cbdca77a7f21afe15b17e644e0e98e64df4",
            "symbol": "MAO"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "0.225",
          "amount1": "-7278.665892612060406662",
          "amountUSD": "638.4772790786170623120275455058865",
          "id": "0x6b2aac2d6a4d183b4419b796e0c02d052697c3fb63cd6f9c5281f4a91d40ee05#922",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "sender": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "timestamp": "1730956463",
          "token0": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          },
          "token1": {
            "decimals": "18",
            "id": "0xf3768d6e78e65fc64b8f12ffc824452130bd5394",
            "symbol": "KEROSENE"
          }
        },
        {
          "amount0": "1004640281.14629559726995377",
          "amount1": "-0.558056426326953027",
          "amountUSD": "1586.234467613829812588341509672413",
          "id": "0x5b5295a8f0d0c1d2faaa72411e2f4e4bc10bfb25727c749b1b534c873635e2ea#7376",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "sender": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "timestamp": "1730957111",
          "token0": {
            "decimals": "18",
            "id": "0x556c3cbdca77a7f21afe15b17e644e0e98e64df4",
            "symbol": "MAO"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "-999553953.313543588263484132",
          "amount1": "0.5",
          "amountUSD": "1421.687227437627726196415767823029",
          "id": "0xab5a25d6002612b7452a73cee38047c432bbbcb66813df3a8af707f728935ed7#7387",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "sender": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "timestamp": "1730957903",
          "token0": {
            "decimals": "18",
            "id": "0x556c3cbdca77a7f21afe15b17e644e0e98e64df4",
            "symbol": "MAO"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "997055068.430259729292825422",
          "amount1": "-0.597816980817936856",
          "amountUSD": "1668.813327795652329956780490016853",
          "id": "0x6a1ad5bffa855b733bacc79eb387ba73c5d4782274c02a92dad313b9fbd41add#7469",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "sender": "0x3328f7f4a1d1c57c35df56bbf0c9dcafca309c49",
          "timestamp": "1730962163",
          "token0": {
            "decimals": "18",
            "id": "0x556c3cbdca77a7f21afe15b17e644e0e98e64df4",
            "symbol": "MAO"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        },
        {
          "amount0": "1.9",
          "amount1": "-6213614742.084274111263714365",
          "amountUSD": "5540.894505303133239094089941888065",
          "id": "0x26d7f8f06dff6f96f9dbc2066058c895dc521ee068661b3bc37316943eca938e#60327",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "sender": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "timestamp": "1731028391",
          "token0": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          },
          "token1": {
            "decimals": "18",
            "id": "0xf19308f923582a6f7c465e5ce7a9dc1bec6665b1",
            "symbol": "TITANX"
          }
        },
        {
          "amount0": "-1016.306977296",
          "amount1": "1",
          "amountUSD": "2911.322033714465642060746307126118",
          "id": "0x6b5ba0ea26063e38715a303a6e66da11885a6a2e95c289ef38e8630baa4e1fcc#22202",
          "origin": "0x0263b02de6b6bf2750e2f9cfecaaee9878fe1998",
          "recipient": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "sender": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
          "timestamp": "1731043415",
          "token0": {
            "decimals": "9",
            "id": "0x42069026eac8eee0fd9b5f7adfa4f6e6d69a2b39",
            "symbol": "MSTR"
          },
          "token1": {
            "decimals": "18",
            "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "symbol": "WETH"
          }
        }
      ];
    for (const v3MockSwap of v3Swaps) {
        it("Корректно обрабатывает своп V3", async () => {
            // Настраиваем поведение моков
            (sendTelegramMessage as jest.Mock).mockResolvedValue(true);
            (executeTrade as jest.Mock).mockResolvedValue({
                status: 1,
                transactionHash: "0x123",
            });

            await processTrade(v3MockSwap);

            expect(sendTelegramMessage).toHaveBeenCalledWith(
                `Новый своп: ${JSON.stringify(v3MockSwap)}`
            );
            expect(executeTrade).toHaveBeenCalled();

            // // Проверяем вызов processTransactionStats
            // expect(processTransactionStats).toHaveBeenCalled();
            // const processTransactionStatsCalls = (
            //     processTransactionStats as jest.Mock
            // ).mock.calls;
            const executeTradeCalls = (executeTrade as jest.Mock).mock.calls;
            // console.log(
            //     "Параметры processTransactionStats V3:",
            //     processTransactionStatsCalls[0]
            // );
            console.log("Параметры executeTrade V2:", executeTradeCalls[0]);
        });
    }
    const v2Swaps = [
        {
          "amount0In": "0",
          "amount0Out": "7186170.478763908",
          "amount1In": "0.050000000000000003",
          "amount1Out": "0",
          "amountUSD": "172.5742061436134842061619756756922",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0xb5906912545406d67542816d39d8b6cbdaa64d909778d8429fb985c6d136a2aa-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0xbbc2e1336cda4354d7c093754464ba62162b222a",
              "symbol": "SPA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735807883"
        },
        {
          "amount0In": "7186170.478763908",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "0.101059765734660924",
          "amountUSD": "342.0915509219282426043695971926234",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x07507533793a9b92baa4aef0fdd56a62d8dc7da5caf36bd0e4c18870bd68a41d-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0xbbc2e1336cda4354d7c093754464ba62162b222a",
              "symbol": "SPA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735808219"
        },
        {
          "amount0In": "0",
          "amount0Out": "5644168.120920482",
          "amount1In": "0.14499999999999999",
          "amount1Out": "0",
          "amountUSD": "504.4647745866022322614949640286745",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x0a0c063696d529fb7f0d66bb707ec3cc0ecdcc74c40675541bcfa830d349a9a9-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0xbbc2e1336cda4354d7c093754464ba62162b222a",
              "symbol": "SPA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735809947"
        },
        {
          "amount0In": "5644168.120920482",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "0.172139629474222698",
          "amountUSD": "583.3384102686455476958767739777575",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0xcfb0ec120006e63693620d5b2385b69be67c9827835a65735c81782ff8be9433-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0xbbc2e1336cda4354d7c093754464ba62162b222a",
              "symbol": "SPA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735810427"
        },
        {
          "amount0In": "0",
          "amount0Out": "1548667.087425244",
          "amount1In": "0.044999999999999998",
          "amount1Out": "0",
          "amountUSD": "155.9515898681495684671952564633218",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0xbf2cc6bdcc193be9b179cf672520914fbe88b3f21eb0ede326d676125a7491ab-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0xbbc2e1336cda4354d7c093754464ba62162b222a",
              "symbol": "SPA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735812575"
        },
        {
          "amount0In": "1548667.087425244",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "0.053099621934848226",
          "amountUSD": "183.0897054418746546212098144327904",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x9928686afdc8b2203728bfb6d8ef12a6838e4f5b5b04e65de470d5a17c3c45b2-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0xbbc2e1336cda4354d7c093754464ba62162b222a",
              "symbol": "SPA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735812839"
        },
        {
          "amount0In": "0",
          "amount0Out": "6503385.63020125",
          "amount1In": "0.195000000000000007",
          "amount1Out": "0",
          "amountUSD": "685.4899063610689389578964346121094",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x359beb6e31752e560136237f3f59cbac7b87250c2e74d80d037bf411147b49de-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0xbbc2e1336cda4354d7c093754464ba62162b222a",
              "symbol": "SPA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735812887"
        },
        {
          "amount0In": "6503385.63020125",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "0.144068537913519187",
          "amountUSD": "491.5315581945472636897061624196874",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x1d2d2b7a69631f61ea06e0001a99af127b49bfe52d4908c9205047729959e93c-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0xbbc2e1336cda4354d7c093754464ba62162b222a",
              "symbol": "SPA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735812923"
        },
        {
          "amount0In": "0",
          "amount0Out": "18108742.031805748",
          "amount1In": "0.129799999999999999",
          "amount1Out": "0",
          "amountUSD": "460.7878614614176137077283119567914",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0xe61695ea5bd50974d64a7e5bb70008f93e2625ebf896d1472c3b63cbfe2428a9-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x9500fd6a02cd2be90cac18d62a12a79446822eac",
              "symbol": "CRX"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735819523"
        },
        {
          "amount0In": "18108742.031805748",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "0.420616122954351514",
          "amountUSD": "1399.610616200021340051165865610558",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0xf0db253dc63ec994e228d42d3d652047465bff0c3f83c9f82cc3f884394a26c6-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x9500fd6a02cd2be90cac18d62a12a79446822eac",
              "symbol": "CRX"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735819871"
        },
        {
          "amount0In": "0",
          "amount0Out": "9446662.18749707",
          "amount1In": "0.298499999999999988",
          "amount1Out": "0",
          "amountUSD": "1063.43244824978607312031352464582",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x37d0880e84cebc4de8b39621bca00e588860830be5193a1643294e9c342b388b-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x9500fd6a02cd2be90cac18d62a12a79446822eac",
              "symbol": "CRX"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735821323"
        },
        {
          "amount0In": "9446662.18749707",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "0.265117602691547389",
          "amountUSD": "900.5403346891906987317792572985775",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0xb804cfee91f1e55512af02daa2da54b552d530b474b1c7b58945a0137f354202-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x9500fd6a02cd2be90cac18d62a12a79446822eac",
              "symbol": "CRX"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735822835"
        },
        {
          "amount0In": "0",
          "amount0Out": "5714444.683733427",
          "amount1In": "0.044999999999999998",
          "amount1Out": "0",
          "amountUSD": "157.6900680553112073113660455706476",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x1af85a5acfda95dccd42b49f6b001fcc90d4b8f64db132170b8f94e7ceb2986d-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x39d8d91a7a494ccc8c113bdc4ba12957c5cb8113",
              "symbol": "VGA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735829435"
        },
        {
          "amount0In": "5714444.683733427",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "0.097661008231158898",
          "amountUSD": "336.8219615758608913890977932681806",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0xcec22b5055f1c5eb82df113327b395dbf41be92c4e548aa15ed3505ccb5848c0-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x39d8d91a7a494ccc8c113bdc4ba12957c5cb8113",
              "symbol": "VGA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735829831"
        },
        {
          "amount0In": "0.207900000000000001",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "28196195.819399902",
          "amountUSD": "749.7631802609569911108876860120619",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0xa9cc0d6f7cc7afc42595c54e17b733ff4a5959465f02214877bbac111ea8e75c-0",
          "pair": {
            "token0": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            },
            "token1": {
              "decimals": "9",
              "id": "0xe03f2a1d17f964543021d61f7ac0d377393b80c1",
              "symbol": "ATM"
            }
          },
          "timestamp": "1735837499"
        },
        {
          "amount0In": "0",
          "amount0Out": "0.601332801750262578",
          "amount1In": "28196195.819399902",
          "amount1Out": "0",
          "amountUSD": "1962.830566365157205160615639855975",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x47bc30cf7464dd80727ceee41d2009caa8346aebf96e67afc53d4218d88f31a1-0",
          "pair": {
            "token0": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            },
            "token1": {
              "decimals": "9",
              "id": "0xe03f2a1d17f964543021d61f7ac0d377393b80c1",
              "symbol": "ATM"
            }
          },
          "timestamp": "1735837619"
        },
        {
          "amount0In": "0",
          "amount0Out": "14105590.48921433",
          "amount1In": "0.100000000000000006",
          "amount1Out": "0",
          "amountUSD": "352.5693155598495899804430765298005",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0xd3037fa727d7ddf63e711a55b3c9d40b29d96596e9dbdb6614a28c15eacc0403-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x5a96c7609a0c3f3bf20f1fb66c90755fdb23d69c",
              "symbol": "PUNKS"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735846259"
        },
        {
          "amount0In": "14105590.48921433",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "0.246911373368370815",
          "amountUSD": "831.9025671583326749270503131935028",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x14275aaa2df43b52e6d840d1943c8bce2fa483f512326fdd50f3639fd931bfee-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x5a96c7609a0c3f3bf20f1fb66c90755fdb23d69c",
              "symbol": "PUNKS"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735846835"
        },
        {
          "amount0In": "0",
          "amount0Out": "748958.714036765",
          "amount1In": "0.017500000000000002",
          "amount1Out": "0",
          "amountUSD": "60.65524651288972165183988091362286",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x2fcf30b5d6939da3d661ba8880811043731f3224daede0447f640f0dd732de36-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x5a96c7609a0c3f3bf20f1fb66c90755fdb23d69c",
              "symbol": "PUNKS"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735848467"
        },
        {
          "amount0In": "748958.714036765",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "0.017365301526642646",
          "amountUSD": "60.15655477365967356206158378215453",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x066b544b9ef0712af9d376a27603a2dcbfc1ffcd6974a0d1399d4d46ea2e0bf3-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x5a96c7609a0c3f3bf20f1fb66c90755fdb23d69c",
              "symbol": "PUNKS"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735848839"
        },
        {
          "amount0In": "0",
          "amount0Out": "3861210.995436758",
          "amount1In": "0.100000000000000006",
          "amount1Out": "0",
          "amountUSD": "349.432283367581326796029775456778",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x1748a4a957aad12cdea64dc176b7406595e2ae0a1c2f89d696bd3739724b3881-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x5a96c7609a0c3f3bf20f1fb66c90755fdb23d69c",
              "symbol": "PUNKS"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735848947"
        },
        {
          "amount0In": "3861210.995436758",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "0.069341247435663986",
          "amountUSD": "238.677190971476809375487299650551",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x0c73bbc2bbc0b988b9b5bc89d620c9e3dd6426854aceb2176f71375b30f535e4-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x5a96c7609a0c3f3bf20f1fb66c90755fdb23d69c",
              "symbol": "PUNKS"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735849319"
        },
        {
          "amount0In": "0",
          "amount0Out": "5215439.768939087",
          "amount1In": "0.149999999999999994",
          "amount1Out": "0",
          "amountUSD": "526.728473128006503808467217993261",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0xa92b5329687febe83cbc5ed3ac031acafd65e8bb6a2a23dd2a0618017defd5c6-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x5a96c7609a0c3f3bf20f1fb66c90755fdb23d69c",
              "symbol": "PUNKS"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735850075"
        },
        {
          "amount0In": "5215439.768939087",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "0.200540174632915433",
          "amountUSD": "684.697765221809591675192827758957",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x06d6c7d068a3995e537cf121ab51b24ee9c88a3d40d12e1af59cb2cbe824546f-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x5a96c7609a0c3f3bf20f1fb66c90755fdb23d69c",
              "symbol": "PUNKS"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735850723"
        },
        {
          "amount0In": "0",
          "amount0Out": "6122437.560172337",
          "amount1In": "0.200000000000000011",
          "amount1Out": "0",
          "amountUSD": "703.9107859718976366875449253890874",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x38572e111d32eff79857beaa896ce7905a4c3e9f9113a17584bc293c7a587d80-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x5a96c7609a0c3f3bf20f1fb66c90755fdb23d69c",
              "symbol": "PUNKS"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735851251"
        },
        {
          "amount0In": "0.147499999999999992",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "19989575.111842317",
          "amountUSD": "522.8090035787201129800508244357539",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x4287705e3208b5eac0e6dee78c4d4b7538328ed7b0cca89f2add25192b331b9e-0",
          "pair": {
            "token0": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            },
            "token1": {
              "decimals": "9",
              "id": "0xf5e9a1c075f93158f455d823e3581e04e977c0a1",
              "symbol": "LFA"
            }
          },
          "timestamp": "1735854587"
        },
        {
          "amount0In": "0",
          "amount0Out": "0.226816623049835833",
          "amount1In": "19989575.111842317",
          "amount1Out": "0",
          "amountUSD": "758.5087971144893530346256026585641",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0xf771642bf58a9560ab6cb6a0a1715898a3fb69abe2b1dbfc55b0fe17da08ea42-0",
          "pair": {
            "token0": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            },
            "token1": {
              "decimals": "9",
              "id": "0xf5e9a1c075f93158f455d823e3581e04e977c0a1",
              "symbol": "LFA"
            }
          },
          "timestamp": "1735854923"
        },
        {
          "amount0In": "0",
          "amount0Out": "14105590.48921433",
          "amount1In": "0.100000000000000006",
          "amount1Out": "0",
          "amountUSD": "351.052750346243474155013217174413",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x29c444d493a9f610342b5509bb5ebbe8da41c478659145e3804d5157833fb482-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x80dcf341eb23e90444806ba5f896cabdf7cebfa8",
              "symbol": "BXA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735863599"
        },
        {
          "amount0In": "14105590.48921433",
          "amount0Out": "0",
          "amount1In": "0",
          "amount1Out": "0.159534010287456795",
          "amountUSD": "538.5073739625149706004247218300254",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0x6e02ad650531cd3742609d4f8b1aa673eec8ab77ca37fe94dd1b1a572253557f-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x80dcf341eb23e90444806ba5f896cabdf7cebfa8",
              "symbol": "BXA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735864007"
        },
        {
          "amount0In": "0",
          "amount0Out": "14916657.17414891",
          "amount1In": "0.445500000000000007",
          "amount1Out": "0",
          "amountUSD": "1601.700767427392817389972041170406",
          "from": "0xf0948d9e11c81faaa0edc54022bf53ff513163b0",
          "id": "0xf13059f6f8212354d76c758dc045dffcadffa54521b6046e527251ea9765fe9d-0",
          "pair": {
            "token0": {
              "decimals": "9",
              "id": "0x80dcf341eb23e90444806ba5f896cabdf7cebfa8",
              "symbol": "BXA"
            },
            "token1": {
              "decimals": "18",
              "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH"
            }
          },
          "timestamp": "1735866635"
        }
      ];
    for (const v2MockSwap of v2Swaps) {
        it("Корректно обрабатывает своп V2", async () => {
            // Настраиваем поведение моков
            (sendTelegramMessage as jest.Mock).mockResolvedValue(true);
            (executeTrade as jest.Mock).mockResolvedValue({
                status: 1,
                transactionHash: "0x456",
            });

            await processTrade(v2MockSwap);

            expect(sendTelegramMessage).toHaveBeenCalledWith(
                `Новый своп: ${JSON.stringify(v2MockSwap)}`
            );
            expect(executeTrade).toHaveBeenCalled();

            // // Проверяем вызов processTransactionStats
            // expect(processTransactionStats).toHaveBeenCalled();
            // const processTransactionStatsCalls = (
            //     processTransactionStats as jest.Mock
            // ).mock.calls;
            const executeTradeCalls = (executeTrade as jest.Mock).mock.calls;
            // console.log(
            //     "Параметры processTransactionStats V2:",
            //     processTransactionStatsCalls[0]
            // );
            console.log("Параметры executeTrade V2:", executeTradeCalls[0]);
        });
    }
});
