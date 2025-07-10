import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { IconSymbol } from '../components/ui/IconSymbol';
import { Colors, DesignTokens } from '../constants/Colors';

// Hide the default expo navigation header
export const unstable_settings = {
  headerShown: false,
};

/**
 * Privacy Policy screen displaying QuStar's privacy policy
 * @returns JSX.Element - Privacy Policy screen component
 */
export default function PrivacyPolicyScreen() {
  /**
   * Handles back navigation
   */
  const handleGoBack = () => {
    router.back();
  };

  return (
    <>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#ffffff', '#f8f9fa', '#ffffff']}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleGoBack} style={styles.backButton}>
              <View style={styles.backButtonInner}>
                <IconSymbol name="chevron.left" size={24} color={Colors.light.text} />
              </View>
            </Pressable>
            <ThemedText type="title" style={styles.headerTitle}>
              Политика конфиденциальности
            </ThemedText>
            <View style={styles.headerRight} />
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <ThemedView style={styles.contentCard}>
              <ThemedText type="subtitle" style={styles.lastUpdated}>
                Последнее обновление: 09 июля 2025 г.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Данная Политика конфиденциальности описывает наши политики и процедуры по сбору, использованию и раскрытию вашей информации при использовании Сервиса и рассказывает о ваших правах на конфиденциальность и о том, как закон защищает вас.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Мы используем ваши персональные данные для предоставления и улучшения Сервиса. Используя Сервис, вы соглашаетесь на сбор и использование информации в соответствии с данной Политикой конфиденциальности.
              </ThemedText>

              {/* Interpretation and Definitions */}
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Толкование и определения
              </ThemedText>

              <ThemedText type="subtitle" style={styles.subsectionTitle}>
                Толкование
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Слова, первая буква которых написана с заглавной буквы, имеют значения, определенные в следующих условиях. Следующие определения имеют одинаковое значение независимо от того, появляются ли они в единственном или множественном числе.
              </ThemedText>

              <ThemedText type="subtitle" style={styles.subsectionTitle}>
                Определения
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Для целей данной Политики конфиденциальности:
              </ThemedText>

              <View style={styles.definitionList}>
                <ThemedText style={styles.definition}>
                  <ThemedText type="bold" style={styles.boldText}>Аккаунт</ThemedText> означает уникальную учетную запись, созданную для вас для доступа к нашему Сервису или его частям.
                </ThemedText>

                <ThemedText style={styles.definition}>
                  <ThemedText type="bold" style={styles.boldText}>Аффилированное лицо</ThemedText> означает юридическое лицо, которое контролирует, контролируется или находится под общим контролем со стороной, где "контроль" означает владение 50% или более акций, долевого участия или других ценных бумаг, дающих право голоса при избрании директоров или другого управляющего органа.
                </ThemedText>

                <ThemedText style={styles.definition}>
                  <ThemedText type="bold" style={styles.boldText}>Приложение</ThemedText> относится к Qustar, программному обеспечению, предоставляемому Компанией.
                </ThemedText>

                <ThemedText style={styles.definition}>
                  <ThemedText type="bold" style={styles.boldText}>Компания</ThemedText> (именуемая как "Компания", "Мы", "Нас" или "Наша" в данном Соглашении) относится к Qustar.
                </ThemedText>

                <ThemedText style={styles.definition}>
                  <ThemedText type="bold" style={styles.boldText}>Страна</ThemedText> относится к: Казахстан
                </ThemedText>

                <ThemedText style={styles.definition}>
                  <ThemedText type="bold" style={styles.boldText}>Устройство</ThemedText> означает любое устройство, которое может получить доступ к Сервису, такое как компьютер, мобильный телефон или цифровой планшет.
                </ThemedText>

                <ThemedText style={styles.definition}>
                  <ThemedText type="bold" style={styles.boldText}>Персональные данные</ThemedText> - это любая информация, которая относится к идентифицированному или идентифицируемому физическому лицу.
                </ThemedText>

                <ThemedText style={styles.definition}>
                  <ThemedText type="bold" style={styles.boldText}>Сервис</ThemedText> относится к Приложению.
                </ThemedText>

                <ThemedText style={styles.definition}>
                  <ThemedText type="bold" style={styles.boldText}>Поставщик услуг</ThemedText> означает любое физическое или юридическое лицо, которое обрабатывает данные от имени Компании. Это относится к сторонним компаниям или физическим лицам, нанятым Компанией для содействия Сервису, предоставления Сервиса от имени Компании, выполнения услуг, связанных с Сервисом, или помощи Компании в анализе использования Сервиса.
                </ThemedText>

                <ThemedText style={styles.definition}>
                  <ThemedText type="bold" style={styles.boldText}>Данные об использовании</ThemedText> относятся к данным, собираемым автоматически, либо генерируемым в результате использования Сервиса, либо из самой инфраструктуры Сервиса (например, продолжительность посещения страницы).
                </ThemedText>

                <ThemedText style={styles.definition}>
                  <ThemedText type="bold" style={styles.boldText}>Вы</ThemedText> означает физическое лицо, получающее доступ к Сервису или использующее его, или компанию, или другое юридическое лицо, от имени которого такое физическое лицо получает доступ к Сервису или использует его, в зависимости от ситуации.
                </ThemedText>
              </View>

              {/* Collecting and Using Your Personal Data */}
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Сбор и использование ваших персональных данных
              </ThemedText>

              <ThemedText type="subtitle" style={styles.subsectionTitle}>
                Типы собираемых данных
              </ThemedText>

              <ThemedText type="bold" style={styles.subSubsectionTitle}>
                Персональные данные
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                При использовании нашего Сервиса мы можем попросить вас предоставить нам определенную личную информацию, которая может быть использована для связи с вами или вашей идентификации. Личная информация может включать, но не ограничивается:
              </ThemedText>

              <View style={styles.bulletList}>
                <ThemedText style={styles.bulletItem}>• Адрес электронной почты</ThemedText>
                <ThemedText style={styles.bulletItem}>• Имя и фамилия</ThemedText>
                <ThemedText style={styles.bulletItem}>• Данные об использовании</ThemedText>
              </View>

              <ThemedText type="bold" style={styles.subSubsectionTitle}>
                Данные об использовании
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Данные об использовании собираются автоматически при использовании Сервиса.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Данные об использовании могут включать такую информацию, как IP-адрес вашего устройства, тип браузера, версия браузера, страницы нашего Сервиса, которые вы посещаете, время и дата вашего посещения, время, проведенное на этих страницах, уникальные идентификаторы устройства и другие диагностические данные.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Когда вы получаете доступ к Сервису через мобильное устройство, мы можем автоматически собирать определенную информацию, включая, но не ограничиваясь, тип используемого вами мобильного устройства, уникальный ID вашего мобильного устройства, IP-адрес вашего мобильного устройства, вашу мобильную операционную систему, тип используемого вами мобильного интернет-браузера, уникальные идентификаторы устройства и другие диагностические данные.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Мы также можем собирать информацию, которую ваш браузер отправляет при каждом посещении нашего Сервиса или при доступе к Сервису через мобильное устройство.
              </ThemedText>

              {/* Use of Your Personal Data */}
              <ThemedText type="subtitle" style={styles.subsectionTitle}>
                Использование ваших персональных данных
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Компания может использовать персональные данные для следующих целей:
              </ThemedText>

              <View style={styles.bulletList}>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>Для предоставления и поддержания нашего Сервиса</ThemedText>, включая мониторинг использования нашего Сервиса.
                </ThemedText>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>Для управления вашим аккаунтом</ThemedText>: для управления вашей регистрацией в качестве пользователя Сервиса. Предоставленные вами персональные данные могут дать вам доступ к различным функциям Сервиса, которые доступны вам как зарегистрированному пользователю.
                </ThemedText>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>Для выполнения договора</ThemedText>: разработка, соблюдение и исполнение договора купли-продажи товаров, предметов или услуг, которые вы приобрели, или любого другого договора с нами через Сервис.
                </ThemedText>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>Для связи с вами</ThemedText>: Для связи с вами по электронной почте, телефонным звонкам, SMS или другим эквивалентным формам электронной связи, таким как push-уведомления мобильного приложения, касающиеся обновлений или информационных сообщений, связанных с функциями, продуктами или договорными услугами, включая обновления безопасности, когда это необходимо или разумно для их реализации.
                </ThemedText>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>Для предоставления вам</ThemedText> новостей, специальных предложений и общей информации о других товарах, услугах и мероприятиях, которые мы предлагаем, которые аналогичны тем, которые вы уже приобрели или о которых запрашивали, если вы не отказались от получения такой информации.
                </ThemedText>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>Для управления вашими запросами</ThemedText>: Для обработки и управления вашими запросами к нам.
                </ThemedText>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>Для деловых операций</ThemedText>: Мы можем использовать вашу информацию для оценки или проведения слияния, отчуждения, реструктуризации, реорганизации, роспуска или другой продажи или передачи некоторых или всех наших активов, будь то как действующее предприятие или как часть банкротства, ликвидации или аналогичного процесса, при котором персональные данные, которыми мы владеем о пользователях нашего Сервиса, находятся среди передаваемых активов.
                </ThemedText>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>Для других целей</ThemedText>: Мы можем использовать вашу информацию для других целей, таких как анализ данных, выявление тенденций использования, определение эффективности наших рекламных кампаний и для оценки и улучшения нашего Сервиса, продуктов, услуг, маркетинга и вашего опыта.
                </ThemedText>
              </View>

              <ThemedText style={styles.paragraph}>
                Мы можем делиться вашей личной информацией в следующих ситуациях:
              </ThemedText>

              <View style={styles.bulletList}>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>С поставщиками услуг</ThemedText>: Мы можем делиться вашей личной информацией с поставщиками услуг для мониторинга и анализа использования нашего Сервиса, для связи с вами.
                </ThemedText>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>При деловых операциях</ThemedText>: Мы можем делиться или передавать вашу личную информацию в связи с любым слиянием, продажей активов Компании, финансированием или приобретением всего или части нашего бизнеса другой компанией, или во время переговоров по таким операциям.
                </ThemedText>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>С аффилированными лицами</ThemedText>: Мы можем делиться вашей информацией с нашими аффилированными лицами, в этом случае мы потребуем от этих аффилированных лиц соблюдения данной Политики конфиденциальности. Аффилированные лица включают нашу материнскую компанию и любые другие дочерние компании, партнеров по совместным предприятиям или другие компании, которые мы контролируем или которые находятся под общим контролем с нами.
                </ThemedText>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>С деловыми партнерами</ThemedText>: Мы можем делиться вашей информацией с нашими деловыми партнерами, чтобы предложить вам определенные продукты, услуги или акции.
                </ThemedText>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>С другими пользователями</ThemedText>: когда вы делитесь личной информацией или иным образом взаимодействуете в общественных областях с другими пользователями, такая информация может быть просмотрена всеми пользователями и может быть публично распространена вне сервиса.
                </ThemedText>
                <ThemedText style={styles.bulletItem}>
                  • <ThemedText type="bold" style={styles.boldText}>С вашего согласия</ThemedText>: Мы можем раскрывать вашу личную информацию для любых других целей с вашего согласия.
                </ThemedText>
              </View>

              {/* Retention of Your Personal Data */}
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Хранение ваших персональных данных
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Компания будет хранить ваши персональные данные только так долго, как это необходимо для целей, изложенных в данной Политике конфиденциальности. Мы будем хранить и использовать ваши персональные данные в той мере, в какой это необходимо для соблюдения наших правовых обязательств (например, если мы обязаны хранить ваши данные для соблюдения применимых законов), разрешения споров и обеспечения соблюдения наших правовых соглашений и политик.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Компания также будет хранить данные об использовании для целей внутреннего анализа. Данные об использовании обычно хранятся в течение более короткого периода времени, за исключением случаев, когда эти данные используются для усиления безопасности или улучшения функциональности нашего Сервиса, или когда мы юридически обязаны хранить эти данные в течение более длительных периодов времени.
              </ThemedText>

              {/* Transfer of Your Personal Data */}
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Передача ваших персональных данных
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Ваша информация, включая персональные данные, обрабатывается в операционных офисах Компании и в любых других местах, где расположены стороны, участвующие в обработке. Это означает, что данная информация может быть передана и храниться на компьютерах, расположенных за пределами вашего штата, провинции, страны или другой правительственной юрисдикции, где законы о защите данных могут отличаться от законов вашей юрисдикции.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Ваше согласие с данной Политикой конфиденциальности, за которым следует предоставление вами такой информации, представляет ваше согласие на такую передачу.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Компания предпримет все разумно необходимые шаги для обеспечения безопасной обработки ваших данных в соответствии с данной Политикой конфиденциальности, и никакая передача ваших персональных данных не будет происходить организации или стране, если не будут приняты адекватные меры контроля, включая безопасность ваших данных и другой личной информации.
              </ThemedText>

              {/* Delete Your Personal Data */}
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Удаление ваших персональных данных
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Вы имеете право удалить или запросить, чтобы мы помогли удалить персональные данные, которые мы собрали о вас.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Наш Сервис может предоставить вам возможность удалить определенную информацию о вас из Сервиса.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Вы можете обновить, изменить или удалить свою информацию в любое время, войдя в свой аккаунт, если он у вас есть, и посетив раздел настроек аккаунта, который позволяет управлять вашей личной информацией. Вы также можете связаться с нами, чтобы запросить доступ, исправление или удаление любой личной информации, которую вы предоставили нам.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Однако обратите внимание, что нам может потребоваться сохранить определенную информацию, когда у нас есть юридическое обязательство или законное основание для этого.
              </ThemedText>

              {/* Disclosure of Your Personal Data */}
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Раскрытие ваших персональных данных
              </ThemedText>

              <ThemedText type="subtitle" style={styles.subsectionTitle}>
                Деловые операции
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Если Компания участвует в слиянии, приобретении или продаже активов, ваши персональные данные могут быть переданы. Мы предоставим уведомление до того, как ваши персональные данные будут переданы и станут предметом другой Политики конфиденциальности.
              </ThemedText>

              <ThemedText type="subtitle" style={styles.subsectionTitle}>
                Правоохранительные органы
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                При определенных обстоятельствах от Компании может потребоваться раскрыть ваши персональные данные, если это требуется по закону или в ответ на действительные запросы государственных органов (например, суда или государственного учреждения).
              </ThemedText>

              <ThemedText type="subtitle" style={styles.subsectionTitle}>
                Другие правовые требования
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Компания может раскрыть ваши персональные данные, добросовестно полагая, что такие действия необходимы для:
              </ThemedText>

              <View style={styles.bulletList}>
                <ThemedText style={styles.bulletItem}>• Соблюдения правового обязательства</ThemedText>
                <ThemedText style={styles.bulletItem}>• Защиты и отстаивания прав или собственности Компании</ThemedText>
                <ThemedText style={styles.bulletItem}>• Предотвращения или расследования возможных правонарушений в связи с Сервисом</ThemedText>
                <ThemedText style={styles.bulletItem}>• Защиты личной безопасности пользователей Сервиса или общественности</ThemedText>
                <ThemedText style={styles.bulletItem}>• Защиты от правовой ответственности</ThemedText>
              </View>

              {/* Security of Your Personal Data */}
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Безопасность ваших персональных данных
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Безопасность ваших персональных данных важна для нас, но помните, что ни один метод передачи через Интернет или метод электронного хранения не является на 100% безопасным. Хотя мы стремимся использовать коммерчески приемлемые средства для защиты ваших персональных данных, мы не можем гарантировать их абсолютную безопасность.
              </ThemedText>

              {/* Children's Privacy */}
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Конфиденциальность детей
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Наш Сервис не предназначен для лиц младше 13 лет. Мы не собираем сознательно личную информацию от лиц младше 13 лет. Если вы являетесь родителем или опекуном и знаете, что ваш ребенок предоставил нам персональные данные, пожалуйста, свяжитесь с нами. Если мы узнаем, что собрали персональные данные от лиц младше 13 лет без проверки согласия родителей, мы предпримем шаги по удалению этой информации с наших серверов.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Если нам необходимо полагаться на согласие как правовое основание для обработки вашей информации, и ваша страна требует согласия родителей, мы можем потребовать согласия ваших родителей до того, как мы соберем и используем эту информацию.
              </ThemedText>

              {/* Links to Other Websites */}
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Ссылки на другие веб-сайты
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Наш Сервис может содержать ссылки на другие веб-сайты, которые не управляются нами. Если вы нажмете на ссылку третьей стороны, вы будете перенаправлены на сайт этой третьей стороны. Мы настоятельно рекомендуем вам ознакомиться с Политикой конфиденциальности каждого сайта, который вы посещаете.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Мы не контролируем и не несем ответственности за содержание, политику конфиденциальности или практики любых сторонних сайтов или сервисов.
              </ThemedText>

              {/* Changes to this Privacy Policy */}
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Изменения в данной Политике конфиденциальности
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Мы можем время от времени обновлять нашу Политику конфиденциальности. Мы уведомим вас о любых изменениях, разместив новую Политику конфиденциальности на данной странице.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Мы сообщим вам по электронной почте и/или через заметное уведомление в нашем Сервисе до того, как изменение вступит в силу, и обновим дату "Последнее обновление" в верхней части данной Политики конфиденциальности.
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                Вам рекомендуется периодически просматривать данную Политику конфиденциальности на предмет любых изменений. Изменения в данной Политике конфиденциальности вступают в силу, когда они размещаются на данной странице.
              </ThemedText>

              {/* Contact Us */}
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Свяжитесь с нами
              </ThemedText>
              <ThemedText style={styles.paragraph}>
                Если у вас есть какие-либо вопросы по поводу данной Политики конфиденциальности, вы можете связаться с нами:
              </ThemedText>

              <ThemedText style={styles.paragraph}>
                По электронной почте: dimashsakennnn@gmail.com
              </ThemedText>

              <View style={styles.bottomSpacing} />
            </ThemedView>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: DesignTokens.spacing.sm,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: DesignTokens.spacing.lg,
  },
  contentCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: DesignTokens.borderRadius.card,
    padding: DesignTokens.spacing.xl,
    marginVertical: DesignTokens.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lastUpdated: {
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: DesignTokens.spacing.lg,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginTop: DesignTokens.spacing.xl,
    marginBottom: DesignTokens.spacing.md,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginTop: DesignTokens.spacing.lg,
    marginBottom: DesignTokens.spacing.sm,
  },
  subSubsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginTop: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.xs,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
    marginBottom: DesignTokens.spacing.md,
    textAlign: 'justify',
  },
  definitionList: {
    marginLeft: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.md,
  },
  definition: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
    marginBottom: DesignTokens.spacing.sm,
    textAlign: 'justify',
  },
  bulletList: {
    marginLeft: DesignTokens.spacing.md,
    marginBottom: DesignTokens.spacing.md,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
    marginBottom: DesignTokens.spacing.xs,
    textAlign: 'justify',
  },
  boldText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: DesignTokens.spacing.xxl,
  },
}); 